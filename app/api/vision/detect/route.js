export const runtime = "nodejs";
export async function POST(request) {
  const apiBase = process.env.VISION_API_URL;
  if (!apiBase) {
    return Response.json(
      { error: "VISION_API_URL belum dikonfigurasi di server." },
      { status: 500 }
    );
  }
  try {
    const incoming = await request.formData();
    const image = incoming.get("image");
    if (!(image instanceof File)) {
      return Response.json(
        { error: "Field upload 'image' wajib diisi." },
        { status: 400 }
      );
    }
    const outgoing = new FormData();
    outgoing.append("image", image, image.name || "upload.jpg");
    const upstream = await fetch(
      `${apiBase.replace(/\/$/, "")}/detect`,
      {
        method: "POST",
        body: outgoing,
        cache: "no-store",
      }
    );
    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw || "Respons backend bukan JSON." };
    }
    if (!upstream.ok) {
      return Response.json(
        { error: data.detail || data.error || "Deteksi gagal." },
        { status: upstream.status }
      );
    }
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error("Vision proxy error:", error);
    return Response.json(
      { error: "Backend Computer Vision tidak dapat dihubungi." },
      { status: 502 }
    );
  }
}
