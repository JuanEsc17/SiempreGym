import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Fuera del componente — persiste entre renders
let qrGlobalInstance = null;

export default function QRScanner() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const scanningRef = useRef(false);
  const divRef = useRef(null);
  const COOLDOWN = 15000;

  const procesarQR = async (qrData) => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setLoading(true);
    setResultado(null);

    try {
      const response = await fetch("http://localhost:3000/api/qr/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      });
      const data = await response.json();
      if (data.ok && data.valido) {
        setResultado({ tipo: "exito", mensaje: `¡Bienvenido ${data.usuario}!` });
      } else {
        setResultado({
          tipo: "error",
          mensaje: data.resultados?.[0]?.razon || data.mensaje || "QR inválido",
        });
      }
    } catch (err) {
      setResultado({ tipo: "error", mensaje: "Error al procesar QR" });
    } finally {
      setLoading(false);
      setTimeout(() => {
        scanningRef.current = false;
        setResultado(null);
      }, COOLDOWN);
    }
  };

  useEffect(() => {
    if (!divRef.current) return;

    // Si ya hay una instancia corriendo, no crear otra
    if (qrGlobalInstance) return;

    const uniqueId = "qr-reader-" + Date.now();
    divRef.current.id = uniqueId;

    const qr = new Html5Qrcode(uniqueId);
    qrGlobalInstance = qr;

    const start = async () => {
      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            procesarQR(decodedText);
          },
          () => {}
        );
      } catch (e) {
        console.error("Error iniciando cámara:", e);
      }
    };

    start();

    return () => {
      if (qrGlobalInstance) {
        const instance = qrGlobalInstance;
        qrGlobalInstance = null;
        instance.isScanning
          ? instance.stop().catch(() => {}).finally(() => instance.clear?.())
          : instance.clear?.();
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#1a1a2e" }}
    >
      <h2 className="text-white text-2xl font-bold mb-6">Escanear QR</h2>

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ width: 300, height: 300, border: "3px solid #8A0BD2" }}
      >
        <div
          ref={divRef}
          style={{ width: 300, height: 300, minHeight: 300, minWidth: 300 }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: "2px solid rgba(138,11,210,0.5)",
            borderRadius: "16px",
          }}
        />
      </div>

      {loading && (
        <p className="mt-4 text-white opacity-60">Procesando...</p>
      )}

      {resultado && (
        <div
          className="mt-6 px-6 py-4 rounded-2xl text-center font-bold text-lg"
          style={{
            background:
              resultado.tipo === "exito"
                ? "rgba(16,185,129,0.15)"
                : "rgba(239,68,68,0.15)",
            border: `1px solid ${resultado.tipo === "exito" ? "#10b981" : "#ef4444"}`,
            color: resultado.tipo === "exito" ? "#34d399" : "#f87171",
            maxWidth: 300,
          }}
        >
          {resultado.tipo === "exito" ? "✓" : "✕"} {resultado.mensaje}
        </div>
      )}

      {!resultado && !loading && (
        <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Apuntá la cámara al código QR
        </p>
      )}
    </div>
  );
}