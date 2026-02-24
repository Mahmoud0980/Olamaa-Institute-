"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import GradientButton from "./GradientButton";
import { useScanQrMutation } from "@/store/services/qrApi";
import { BrowserQRCodeReader } from "@zxing/browser";
import { notify } from "@/lib/helpers/toastify";
function sanitizeQrContent(text) {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r?\n|\r/g, "")
    .trim();
}

function pickBestDeviceId(devices = []) {
  if (!devices.length) return undefined;

  // جرّب الخلفية أولاً (labels تظهر غالباً بعد السماح)
  const back =
    devices.find((d) => /back|rear|environment/i.test(d.label)) ||
    devices.find((d) => /camera 2|camera2/i.test(d.label));

  // على كثير موبايلات: آخر كاميرا بالقائمة هي الخلفية
  return (back || devices[devices.length - 1])?.deviceId;
}

export default function QRModal({ onClose }) {
  const router = useRouter();
  const videoRef = useRef(null);

  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const processingRef = useRef(false);

  const [hasCamera, setHasCamera] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [scanQr, { isLoading }] = useScanQrMutation();

  const stopScanner = useCallback(() => {
    try {
      if (controlsRef.current?.stop) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }

      if (readerRef.current) {
        if (typeof readerRef.current.stopContinuousDecode === "function") {
          readerRef.current.stopContinuousDecode();
        }
        if (typeof readerRef.current.stopAsyncDecode === "function") {
          readerRef.current.stopAsyncDecode();
        }
        readerRef.current = null;
      }

      const stream = videoRef.current?.srcObject;
      if (stream && typeof stream.getTracks === "function") {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch (e) {
      console.error("STOP CAMERA ERROR", e);
    } finally {
      processingRef.current = false;
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkCamera = async () => {
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        if (mounted) setHasCamera(devices.length > 0);
      } catch {
        if (mounted) setHasCamera(false);
      }
    };

    checkCamera();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [stopScanner]);

  const startScanner = useCallback(async () => {
    if (scanning || isLoading) return;

    processingRef.current = false;
    setScanning(true);

    const reader = new BrowserQRCodeReader();
    readerRef.current = reader;

    try {
      // ✅ تهيئة صلاحيات على الموبايل (حتى تظهر labels وتكون الأجهزة واضحة)
      // (نوقف الستريم فوراً، بس مهم لطلب الإذن)
      if (navigator?.mediaDevices?.getUserMedia) {
        try {
          const tmp = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
          });
          tmp.getTracks().forEach((t) => t.stop());
        } catch {
          // المستخدم رفض أو المتصفح منع.. رح نجرب ZXing كمان
        }
      }

      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      setHasCamera(devices.length > 0);

      if (!videoRef.current) {
        stopScanner();
        return;
      }

      const deviceId = pickBestDeviceId(devices);

      const controls = await reader.decodeFromVideoDevice(
        deviceId, // ممكن يكون undefined => ZXing يختار الافتراضي
        videoRef.current,
        async (result) => {
          if (!result || processingRef.current) return;

          processingRef.current = true;
          stopScanner();

          const cleanQr = sanitizeQrContent(result.getText());
          const apiResult = await scanQr(cleanQr);

          if (apiResult?.error) {
            notify.error("QR غير صالح");
            processingRef.current = false;
            return;
          }

          const studentId = apiResult?.data?.student?.id;
          if (!studentId) {
            notify.error("لم يتم العثور على الطالب");
            processingRef.current = false;
            return;
          }

          onClose?.();
          router.push(`/studentShortdata?id=${studentId}`);
        },
      );

      controlsRef.current = controls;
    } catch (e) {
      console.error("START SCAN ERROR", e);
      stopScanner();
    }
  }, [scanning, isLoading, scanQr, router, onClose, stopScanner]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white w-[420px] max-w-[92vw] rounded-2xl p-6 relative flex flex-col items-center shadow-xl">
        <button
          onClick={() => {
            stopScanner();
            onClose?.();
          }}
          className="absolute top-4 left-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="font-bold text-[16px] mb-6">Scan QR Code</h2>

        <div className="relative w-[280px] h-[280px] max-w-[78vw] max-h-[78vw] rounded-xl overflow-hidden border-2 border-[#C61062]">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />

          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-line" />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          ضع رمز QR داخل الإطار
        </p>

        <GradientButton
          className="mt-6 w-full"
          onClick={startScanner}
          disabled={!hasCamera || scanning || isLoading}
        >
          {!hasCamera
            ? "لا يوجد كاميرا"
            : scanning
              ? "جاري المسح..."
              : isLoading
                ? "جارٍ التحقق..."
                : "بدء المسح"}
        </GradientButton>
      </div>

      <style jsx>{`
        .scan-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #c61062, transparent);
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </div>
  );
}
