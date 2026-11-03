"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  VoiceLanguage,
  SpeechRecognitionStatus,
  SpeechSynthesisStatus,
} from "./assistant-types";
import {
  cleanTextForSpeech,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  findBestVoiceForLanguage,
  detectVoiceCapabilities,
} from "./voice-service";

// Web Speech API interface declarations for TypeScript compatibility
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
  0: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface UseSpeechOptions {
  defaultLanguage?: VoiceLanguage;
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<VoiceLanguage>(
    options.defaultLanguage || "en-IN"
  );
  const [recognitionStatus, setRecognitionStatus] =
    useState<SpeechRecognitionStatus>("idle");
  const [synthesisStatus, setSynthesisStatus] =
    useState<SpeechSynthesisStatus>("idle");
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isSTTSupported = isSpeechRecognitionAvailable();
  const isTTSSupported = isSpeechSynthesisAvailable();

  // Populate system voices on mount and voice change event
  useEffect(() => {
    if (!isTTSSupported) return;

    const updateVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      }
    };

    updateVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isTTSSupported]);

  // Clean up ongoing speech or recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Safe unmount
        }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Safe unmount
        }
      }
    };
  }, []);

  /**
   * Starts speech-to-text recognition with explicit user activation.
   */
  const startListening = useCallback(
    (
      onResult: (text: string, isFinal: boolean) => void,
      onErrorCallback?: (errCode: string) => void
    ) => {
      if (!isSTTSupported) {
        setRecognitionStatus("unsupported");
        setErrorMessage("Voice input is not supported in this browser.");
        return;
      }

      // Interrupt any ongoing speech synthesis first
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSynthesisStatus("idle");
        setActiveSpeakingId(null);
      }

      try {
        const SpeechRecognitionClass =
          (window as unknown as { SpeechRecognition?: new () => ISpeechRecognition })
            .SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => ISpeechRecognition;
            }
          ).webkitSpeechRecognition;

        if (!SpeechRecognitionClass) {
          setRecognitionStatus("unsupported");
          return;
        }

        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedVoiceLang;

        recognition.onstart = () => {
          setRecognitionStatus("listening");
          setErrorMessage(null);
          setInterimTranscript("");
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentInterim = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            const transcript = item[0]?.transcript || "";
            if (item.isFinal) {
              finalTranscript += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
            onResult(currentInterim, false);
          }

          if (finalTranscript) {
            setInterimTranscript("");
            setRecognitionStatus("processing");
            onResult(finalTranscript.trim(), true);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const err = event.error;
          if (err === "not-allowed" || err === "service-not-allowed") {
            setRecognitionStatus("permission-denied");
            setErrorMessage(
              "Microphone access blocked. Please allow microphone permissions in your browser bar."
            );
          } else if (err === "no-speech") {
            setRecognitionStatus("idle");
          } else {
            setRecognitionStatus("error");
            setErrorMessage(`Recognition error: ${err}`);
          }
          if (onErrorCallback) {
            onErrorCallback(err);
          }
        };

        recognition.onend = () => {
          setRecognitionStatus("idle");
          setInterimTranscript("");
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("SpeechRecognition start failed:", err);
        setRecognitionStatus("error");
        setErrorMessage("Could not start microphone.");
      }
    },
    [isSTTSupported, selectedVoiceLang]
  );

  /**
   * Stops active speech recognition cleanly.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe stop
      }
      setRecognitionStatus("idle");
      setInterimTranscript("");
    }
  }, []);

  /**
   * Speaks the provided text using browser-native SpeechSynthesis.
   * Can be interrupted at any time.
   */
  const speak = useCallback(
    (rawText: string, messageId?: string) => {
      if (!isTTSSupported) {
        setSynthesisStatus("unsupported");
        return;
      }

      // If already speaking this message, toggle stop (interrupt)
      if (synthesisStatus === "speaking" && activeSpeakingId === messageId) {
        window.speechSynthesis.cancel();
        setSynthesisStatus("idle");
        setActiveSpeakingId(null);
        return;
      }

      // Interrupt any prior speech
      window.speechSynthesis.cancel();

      const textToSpeak = cleanTextForSpeech(rawText);
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = selectedVoiceLang;

      // Select best matching voice from detected available voices
      const bestVoice = findBestVoiceForLanguage(availableVoices, selectedVoiceLang);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Slightly relaxed rate for natural clarity
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setSynthesisStatus("speaking");
        setActiveSpeakingId(messageId || null);
      };

      utterance.onend = () => {
        setSynthesisStatus("idle");
        setActiveSpeakingId(null);
      };

      utterance.onerror = (e) => {
        // Ignore "interrupted" or "canceled" errors caused by user stop
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("SpeechSynthesis error:", e.error);
        }
        setSynthesisStatus("idle");
        setActiveSpeakingId(null);
      };

      utterance.onpause = () => {
        setSynthesisStatus("paused");
      };

      utterance.onresume = () => {
        setSynthesisStatus("speaking");
      };

      window.speechSynthesis.speak(utterance);
    },
    [isTTSSupported, synthesisStatus, activeSpeakingId, selectedVoiceLang, availableVoices]
  );

  /**
   * Pauses active speech synthesis.
   */
  const pauseSpeaking = useCallback(() => {
    if (isTTSSupported && synthesisStatus === "speaking") {
      window.speechSynthesis.pause();
      setSynthesisStatus("paused");
    }
  }, [isTTSSupported, synthesisStatus]);

  /**
   * Resumes paused speech synthesis.
   */
  const resumeSpeaking = useCallback(() => {
    if (isTTSSupported && synthesisStatus === "paused") {
      window.speechSynthesis.resume();
      setSynthesisStatus("speaking");
    }
  }, [isTTSSupported, synthesisStatus]);

  /**
   * Immediately interrupts/cancels active speech synthesis.
   */
  const stopSpeaking = useCallback(() => {
    if (isTTSSupported) {
      window.speechSynthesis.cancel();
      setSynthesisStatus("idle");
      setActiveSpeakingId(null);
    }
  }, [isTTSSupported]);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setRecognitionStatus("idle");
  }, []);

  const capabilities = detectVoiceCapabilities(availableVoices);

  return {
    isSTTSupported,
    isTTSSupported,
    recognitionStatus,
    synthesisStatus,
    activeSpeakingId,
    interimTranscript,
    errorMessage,
    selectedVoiceLang,
    setSelectedVoiceLang,
    autoSpeak,
    toggleAutoSpeak,
    startListening,
    stopListening,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    clearError,
    capabilities,
  };
}
