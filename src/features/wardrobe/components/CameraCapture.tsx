import { useEffect, useRef, useState } from 'react';
import { cameraErrorMessage } from '../fileProcessing';

type CameraCaptureProps = {
  /** Shown in the dialog title, e.g. «الصورة الأمامية». */
  label: string;
  /** The captured photo, as a JPEG file (processed like any picked file). */
  onCapture: (file: File) => void;
  onClose: () => void;
};

type Status = 'starting' | 'live' | 'error';

/**
 * Live camera preview in its own modal dialog (stacked above the product form).
 * Mounted only while open; every MediaStream track is stopped when it closes,
 * when a photo is taken, or when the form unmounts.
 */
export function CameraCapture({ label, onCapture, onClose }: CameraCaptureProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>('starting');
  const [error, setError] = useState<string>();

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(async (media) => {
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = media;
        const v = video.current;
        if (!v) return;
        v.srcObject = media;
        await v.play();
        if (!cancelled) setStatus('live');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.warn('Camera unavailable:', err);
        setError(cameraErrorMessage(err));
        setStatus('error');
      });

    return () => {
      cancelled = true;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      if (video.current) video.current.srcObject = null;
      if (el?.open) el.close();
    };
  }, []);

  function capture() {
    const v = video.current;
    if (!v || status !== 'live' || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d')?.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('تعذّر التقاط الصورة. حاول مجددًا.');
          return;
        }
        onCapture(new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
        onClose();
      },
      'image/jpeg',
      0.92,
    );
  }

  return (
    <dialog
      ref={dialog}
      className="wd-dialog wd-camera"
      aria-label={`التقاط ${label} بالكاميرا`}
      onCancel={(e) => {
        // Escape closes only the camera, never the product form beneath it.
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="wd-dialog__body">
        <header className="wd-dialog__header">
          <h2>التقاط {label}</h2>
          <button type="button" className="wd-icon-btn" aria-label="إغلاق الكاميرا" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="wd-camera__view">
          <video ref={video} playsInline muted aria-label="معاينة الكاميرا" hidden={status === 'error'} />
          {status === 'starting' && <p className="wd-camera__status" role="status">جارٍ تشغيل الكاميرا… قد يطلب المتصفح الإذن.</p>}
        </div>
        {error && (
          <div className="wd-alert wd-alert--error" role="alert">
            {error}
          </div>
        )}
        <footer className="wd-row wd-camera__actions">
          <button type="button" className="wd-btn wd-btn--ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="button" className="wd-btn wd-btn--primary" onClick={capture} disabled={status !== 'live'}>
            التقاط الصورة
          </button>
        </footer>
      </div>
    </dialog>
  );
}
