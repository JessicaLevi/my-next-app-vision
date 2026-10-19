"use client";
import { useEffect, useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  ScanSearch,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Boxes,
  ChevronRight,
} from "lucide-react";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function VisionPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;
    setError("");
    setResult(null);

    // Bersihkan URL preview lama jika ada untuk mencegah kebocoran memori
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFile(null);
      setError("Gunakan gambar JPEG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError("Ukuran gambar maksimum 8 MiB.");
      event.target.value = "";
      return;
    }

    setFile(selected);
    // Langsung buat dan pasang URL preview di sini saat file dipilih
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function resetDetection() {
    if (loading) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    const input = document.getElementById("vision-image");
    if (input) input.value = "";
  }

  function handleFileChange(event) {
    const selected = event.target.files?.[0] || null;
    setError("");
    setResult(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFile(null);
      setError("Gunakan gambar JPEG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }
    if (selected.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError("Ukuran gambar maksimum 8 MiB.");
      event.target.value = "";
      return;
    }
    setFile(selected);
  }

  async function runDetection() {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/vision/detect", {
        method: "POST",
        body: form,
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Deteksi gagal.");
      }
      if (!Array.isArray(data.detections) || typeof data.count !== "number") {
        throw new Error("Format hasil deteksi dari backend tidak sesuai.");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function resetDetection() {
    if (loading) return;
    setFile(null);
    setResult(null);
    setError("");
    const input = document.getElementById("vision-image");
    if (input) input.value = "";
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-28 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
            <Sparkles size={14} /> COMPUTER VISION LAB
          </div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Object Detection<span className="text-emerald-500">.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
                Analisis gambar menggunakan YOLO untuk mendeteksi sampah
                otomatis.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <label
              htmlFor="vision-image"
              className="group flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-5 text-center transition hover:border-emerald-500"
            >
              <ImageIcon size={30} className="text-emerald-500 mb-2" />
              <span className="font-medium">
                {file ? "Ganti gambar" : "Klik untuk memilih gambar"}
              </span>
            </label>
            <input
              id="vision-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="sr-only"
            />

            {file && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3 bg-muted/20">
                <span className="truncate text-sm font-medium">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={resetDetection}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 text-sm text-red-500 flex gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button
              type="button"
              onClick={runDetection}
              disabled={!file || loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-40"
            >
              {loading ? (
                <LoaderCircle size={19} className="animate-spin" />
              ) : (
                <ScanSearch size={19} />
              )}{" "}
              Deteksi Objek
            </button>
          </div>

          <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border p-4 bg-muted/10 font-semibold">
              {result ? "Hasil Deteksi" : "Preview Gambar"}
            </div>
            <div className="flex flex-1 items-center justify-center p-4 bg-black/[0.02]">
              {result?.annotated_image ? (
                <img
                  src={result.annotated_image}
                  alt="Hasil"
                  className="max-h-[400px] object-contain rounded-lg"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[400px] object-contain rounded-lg"
                />
              ) : (
                <span className="text-muted-foreground text-sm">
                  Belum ada gambar yang dipilih
                </span>
              )}
            </div>
          </div>
        </section>

        {result && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Boxes className="text-emerald-500" /> Ringkasan Objek (
              {result.count})
            </h3>
            <table className="w-full text-left text-sm mt-4">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2">#</th>
                  <th className="py-2">Label Sampah</th>
                  <th className="py-2">Tingkat Akurasi</th>
                </tr>
              </thead>
              <tbody>
                {result.detections.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3">{idx + 1}</td>
                    <td className="py-3 font-medium text-emerald-500">
                      {item.label}
                    </td>
                    <td className="py-3 font-mono">
                      {(item.confidence * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}
