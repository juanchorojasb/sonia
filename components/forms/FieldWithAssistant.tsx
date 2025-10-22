'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Check,
  Copy,
  RefreshCw
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FieldWithAssistantProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  fieldType?: 'input' | 'textarea';
  rows?: number;
  contextPrompt?: string; // Contexto específico para el asistente
}

export default function FieldWithAssistant({
  label,
  name,
  value,
  onChange,
  placeholder,
  description,
  fieldType = 'textarea',
  rows = 3,
  contextPrompt
}: FieldWithAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Función para iniciar grabación de voz
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  // Función para detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // Función para transcribir audio (placeholder - necesitarás implementar con Whisper o similar)
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // TODO: Implementar transcripción real con Groq Whisper o Web Speech API
      // Por ahora simulamos con Web Speech API si está disponible
      
      // Alternativa: usar SpeechRecognition API del navegador
      const text = await simulateTranscription();
      
      if (text) {
        onChange(value ? `${value} ${text}` : text);
      }
    } catch (error) {
      console.error('Error al transcribir:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulación de transcripción - reemplazar con API real
  const simulateTranscription = async (): Promise<string> => {
    return new Promise((resolve) => {
      // Aquí irá la integración con Groq Whisper o Web Speech API
      setTimeout(() => {
        resolve('[Texto transcrito desde audio]');
      }, 1000);
    });
  };

  // Función para obtener sugerencia de IA
  const getAISuggestion = async () => {
    setLoadingAI(true);
    setShowSuggestion(true);

    try {
      const prompt = contextPrompt || `Proporciona un ejemplo apropiado para el campo "${label}". ${description || ''}`;
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt,
          context: `Campo: ${label}. Necesito un ejemplo concreto y breve (2-3 líneas máximo).`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.message);
      } else {
        setAiSuggestion('No se pudo generar una sugerencia. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al obtener sugerencia:', error);
      setAiSuggestion('Error al conectar con el asistente.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Función para aplicar sugerencia
  const applySuggestion = () => {
    onChange(aiSuggestion);
    setShowSuggestion(false);
  };

  // Función para copiar sugerencia
  const copySuggestion = () => {
    navigator.clipboard.writeText(aiSuggestion);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex gap-2">
          {/* Botón de IA */}
          <Popover open={showSuggestion} onOpenChange={setShowSuggestion}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getAISuggestion}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Ayuda IA</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Sugerencia del Asistente</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">
                    {aiSuggestion || 'Generando sugerencia...'}
                  </p>
                </div>
                {aiSuggestion && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={applySuggestion}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aplicar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={copySuggestion}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={getAISuggestion}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Botón de Voz */}
          <Button
            type="button"
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">
              {isRecording ? 'Detener' : 'Voz'}
            </span>
          </Button>
        </div>
      </div>

      {/* Campo de entrada */}
      {fieldType === 'textarea' ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={isRecording ? 'border-red-500 border-2' : ''}
        />
      ) : (
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={isRecording ? 'border-red-500 border-2' : ''}
        />
      )}

      {/* Descripción */}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {/* Indicador de grabación */}
      {isRecording && (
        <p className="text-xs text-red-600 flex items-center gap-1 animate-pulse">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          Grabando... Habla con claridad
        </p>
      )}
    </div>
  );
}