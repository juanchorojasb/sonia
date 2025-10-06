'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Volume2 } from 'lucide-react';

interface AIAssistantProps {
  patientId?: string;
  context?: string;
}

export default function AIAssistant({ patientId, context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Inicializar reconocimiento de voz
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'es-ES';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Inicializar síntesis de voz
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakMessage = (text: string) => {
    if (!synthRef.current) return;

    // Cancelar si ya está hablando
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (autoSpeak = false) => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          patientId,
          context,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        
        // Hablar la respuesta automáticamente si se usó voz
        if (autoSpeak) {
          setTimeout(() => speakMessage(data.message), 500);
        }
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Lo siento, hubo un error al procesar tu mensaje.' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error de conexión.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Asistente sonIA</CardTitle>
              {isSpeaking && (
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-blue-600 animate-pulse"></div>
                  <div className="w-1 h-4 bg-blue-600 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1 h-4 bg-blue-600 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Hola, soy tu asistente para gestionar el tratamiento médico.</p>
                <p className="text-xs mt-2">Puedes escribir o usar el micrófono para hablar conmigo.</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="self-start"
                      onClick={() => speakMessage(msg.content)}
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Escuchar
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleListening}
                disabled={loading}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                placeholder={isListening ? "Escuchando..." : "Escribe o habla..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(false)}
                disabled={loading || isListening}
              />
              <Button onClick={() => sendMessage(false)} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isSpeaking && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={stopSpeaking}
              >
                Detener audio
              </Button>
            )}
          </div>
        </Card>
      )}
    </>
  );
}