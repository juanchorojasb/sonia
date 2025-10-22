'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Plus,
  X
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TagFieldWithAssistantProps {
  label: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  description?: string;
  contextPrompt: string;
}

export default function TagFieldWithAssistant({
  label,
  values,
  onAdd,
  onRemove,
  placeholder,
  description,
  contextPrompt
}: TagFieldWithAssistantProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Función para obtener sugerencias de IA (genera múltiples)
  const getAISuggestions = async () => {
    setLoadingAI(true);
    setShowSuggestions(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `${contextPrompt}. Dame 3-5 ejemplos específicos y concretos. Responde SOLO con los ejemplos separados por comas, sin explicaciones adicionales.`,
          context: `Campo: ${label}. Necesito ejemplos breves (máximo 5 palabras cada uno).`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Parsear la respuesta y separar por comas
        const suggestions = data.message
          .split(/[,\n]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && s.length < 100)
          .slice(0, 5);
        
        setAiSuggestions(suggestions);
      } else {
        setAiSuggestions(['No se pudieron generar sugerencias']);
      }
    } catch (error) {
      console.error('Error al obtener sugerencias:', error);
      setAiSuggestions(['Error al conectar con el asistente']);
    } finally {
      setLoadingAI(false);
    }
  };

  // Aplicar una sugerencia
  const applySuggestion = (suggestion: string) => {
    onAdd(suggestion);
  };

  // Entrada por voz (simplificada)
  const startRecording = async () => {
    try {
      // Usar Web Speech API si está disponible
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
          alert('Error al reconocer voz. Intenta de nuevo.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } else {
        alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      }
    } catch (error) {
      console.error('Error al iniciar reconocimiento de voz:', error);
      alert('No se pudo acceder al micrófono.');
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-2">
          {/* Botón de IA */}
          <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getAISuggestions}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="ml-2 hidden sm:inline">Ideas IA</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Sugerencias del Asistente</h4>
                {loadingAI ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full text-left text-sm p-2 rounded-md hover:bg-blue-50 border border-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
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
            onClick={startRecording}
            disabled={isRecording}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">
              {isRecording ? 'Escuchando...' : 'Voz'}
            </span>
          </Button>
        </div>
      </div>

      {/* Input field */}
      <div className="flex gap-2">
        <Input 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className={isRecording ? 'border-red-500 border-2' : ''}
        />
        <Button type="button" onClick={handleAdd} size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tags display */}
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((value, idx) => (
          <Badge key={idx} variant="secondary" className="gap-1">
            {value}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => onRemove(idx)}
            />
          </Badge>
        ))}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <p className="text-xs text-red-600 flex items-center gap-1 animate-pulse">
          <span className="w-2 h-2 bg-red-600 rounded-full" />
          Escuchando... Habla ahora
        </p>
      )}
    </div>
  );
}