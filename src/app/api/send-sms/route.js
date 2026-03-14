import { NextResponse } from "next/server";

function stringToUnicodeHex(text = "") {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(4, "0"))
    .join("");
}

function normalizeSyrianPhone(phone = "") {
  const raw = String(phone).trim().replace(/[^\d+]/g, "");

  if (!raw) return "";

  if (raw.startsWith("+963")) return raw.slice(1);
  if (raw.startsWith("963")) return raw;
  if (raw.startsWith("09")) return `963${raw.slice(1)}`;
  if (raw.startsWith("9")) return `963${raw}`;

  return raw;
}

function normalizeLang(lang) {
  return String(lang) === "1" ? 1 : 0;
}

function buildProviderUrl({ phone, msgHex, lang }) {
  const params = new URLSearchParams({
    User: "olmlmrr802",
    Pass: "olaasd181012",
    From: "Al Olamaa",
    Gsm: phone,
    Msg: msgHex,
    Lang: String(lang),
  });

  return `https://services.mtnsyr.com:7443/general/MTNSERVICES/ConcatenatedSender.aspx?${params.toString()}`;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const phone = normalizeSyrianPhone(body?.phone || "");
    const message = String(body?.message || "");
    const lang = normalizeLang(body?.lang ?? 0);

    if (!phone) {
      return NextResponse.json(
        { status: false, message: "رقم الهاتف مطلوب" },
        { status: 400 },
      );
    }

    if (!message.trim()) {
      return NextResponse.json(
        { status: false, message: "نص الرسالة مطلوب" },
        { status: 400 },
      );
    }

    const msgHex = stringToUnicodeHex(message);
    const url = buildProviderUrl({ phone, msgHex, lang });

    let response;
    let providerResponse = "";

    try {
      response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
      providerResponse = await response.text();
    } catch (error) {
      return NextResponse.json(
        {
          status: false,
          message: "فشل الاتصال بمزود الرسائل",
          upstream_error:
            error?.cause?.message || error?.message || "fetch failed",
          provider_host: "services.mtnsyr.com:7443",
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          message: "فشل في إرسال الرسالة عبر المزود",
          provider_status: response.status,
          provider_response: providerResponse,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      status: true,
      message: "تم إرسال الرسالة بنجاح",
      provider_response: providerResponse,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message: "حدث خطأ أثناء معالجة طلب إرسال الرسالة",
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
