import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Wifi, 
  Globe, 
  Mail, 
  Phone, 
  User, 
  Download, 
  Copy, 
  Check, 
  Palette, 
  Sparkles,
  Barcode
} from 'lucide-react';
import QRCode from 'qrcode';

type QrType = 'url' | 'wifi' | 'email' | 'phone' | 'vcard' | 'text' | 'barcode' | 'upi';

export const QRCodeTool: React.FC = () => {
  const [qrType, setQrType] = useState<QrType>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('https://google.com');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState('SecretPassword123');
  const [wifiType, setWifiType] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  const [emailTo, setEmailTo] = useState('hello@example.com');
  const [emailSub, setEmailSub] = useState('Hello there!');
  const [emailBody, setEmailBody] = useState('Writing from the QR code generator...');

  const [phoneNum, setPhoneNum] = useState('+1 (555) 019-2834');

  const [vcardName, setVcardName] = useState('Alex Johnson');
  const [vcardPhone, setVcardPhone] = useState('+1 555-019-2834');
  const [vcardEmail, setVcardEmail] = useState('alex@company.com');
  const [vcardOrg, setVcardOrg] = useState('Acme Corp');

  const [rawText, setRawText] = useState('Scan this to reveal secret message.');
  const [barcodeValue, setBarcodeValue] = useState('978020137962');
  const [upiId, setUpiId] = useState('name@bank');
  const [upiName, setUpiName] = useState('Payee Name');
  const [upiAmount, setUpiAmount] = useState('');
  const [upiNote, setUpiNote] = useState('');
  const upiIdValid = /^[\w.-]{2,}@[\w.-]{2,}$/.test(upiId.trim());
  const upiAmountValid = upiAmount === '' || /^(?:[1-9]\d*(?:\.\d{1,2})?|0\.\d{1,2})$/.test(upiAmount) && Number(upiAmount) > 0;
  const upiValid = upiIdValid && upiName.trim().length > 0 && upiAmountValid;

  // Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrSize, setQrSize] = useState(240);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Compute final QR payload
  const getQrPayload = (): string => {
    switch (qrType) {
      case 'url':
        return urlInput.startsWith('http') ? urlInput : `https://${urlInput}`;
      case 'wifi':
        return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};H:${wifiHidden};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSub)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneNum.replace(/[^\d+]/g, '')}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case 'text':
        return rawText;
      case 'upi': {
        if (!upiValid) return '';
        const params = new URLSearchParams({ pa: upiId.trim(), pn: upiName.trim(), cu: 'INR' });
        if (upiAmount) params.set('am', Number(upiAmount).toFixed(2));
        if (upiNote.trim()) params.set('tn', upiNote.trim());
        return `upi://pay?${params.toString()}`;
      }
      default:
        return urlInput;
    }
  };

  useEffect(() => {
    if (qrType === 'barcode') {
      renderBarcode();
      return;
    }

    const payload = getQrPayload();
    if (!payload) { setDataUrl(''); return; }
    QRCode.toDataURL(payload, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR error', err));
  }, [
    qrType,
    urlInput,
    wifiSsid,
    wifiPass,
    wifiType,
    wifiHidden,
    emailTo,
    emailSub,
    emailBody,
    phoneNum,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    rawText,
    fgColor,
    bgColor,
    qrSize,
    errorLevel,
    barcodeValue,
    upiId, upiName, upiAmount, upiNote,
  ]);

  // Render Barcode on Canvas
  const renderBarcode = () => {
    const canvas = barcodeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 320;
    const height = 120;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = fgColor;
    // Generate pseudo-code128 aesthetic bars deterministically from string
    const code = barcodeValue || '1234567890';
    let x = 20;
    const barHeight = 70;

    // Start guard pattern
    [2, 1, 2].forEach((w) => {
      ctx.fillRect(x, 20, w * 2, barHeight);
      x += (w + 1) * 2;
    });

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const pattern = [(charCode % 3) + 1, ((charCode >> 1) % 3) + 1, ((charCode >> 2) % 3) + 1];
      pattern.forEach((w) => {
        ctx.fillRect(x, 20, w * 1.8, barHeight);
        x += (w + 1.2) * 1.8;
      });
      if (x > width - 30) break;
    }

    // End guard
    [2, 1, 2].forEach((w) => {
      ctx.fillRect(x, 20, w * 2, barHeight);
      x += (w + 1) * 2;
    });

    // Draw text label below bars
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(code, width / 2, 105);
  };

  const handleDownload = () => {
    if (qrType === 'barcode') {
      const canvas = barcodeCanvasRef.current;
      if (!canvas) return;
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `barcode_${barcodeValue || 'code'}.png`;
      a.click();
      return;
    }

    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode_${qrType}.png`;
    a.click();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(getQrPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
      {/* Template Type Switches */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setQrType('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'url' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> URL Link
        </button>
        <button
          onClick={() => setQrType('wifi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'wifi' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" /> WiFi Network
        </button>
        <button
          onClick={() => setQrType('vcard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'vcard' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Contact Card
        </button>
        <button
          onClick={() => setQrType('email')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'email' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </button>
        <button
          onClick={() => setQrType('phone')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'phone' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Phone className="w-3.5 h-3.5" /> Phone
        </button>
        <button
          onClick={() => setQrType('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'text' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" /> Plain Text
        </button>
        <button
          onClick={() => setQrType('upi')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${qrType === 'upi' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          <QrCode className="w-3.5 h-3.5" /> UPI Payment
        </button>
        <button
          onClick={() => setQrType('barcode')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
            qrType === 'barcode' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" /> Barcode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs & Settings */}
        <div className="lg:col-span-7 space-y-4">
          {qrType === 'url' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Target Website URL
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Network SSID Name
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Encryption
                  </label>
                  <select
                    value={wifiType}
                    onChange={(e) => setWifiType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {qrType === 'vcard' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Company / Org
                </label>
                <input
                  type="text"
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {qrType === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {qrType === 'phone' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Phone Number to Dial
              </label>
              <input
                type="text"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          )}

          {qrType === 'text' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Raw Text or Message
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          )}

          {qrType === 'barcode' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Barcode Number / SKU String
              </label>
              <input
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>
          )}

          {qrType === 'upi' && (
            <div className="space-y-3">
              <div><label className="block text-xs font-medium mb-1">UPI ID</label><input value={upiId} onChange={(e) => setUpiId(e.target.value)} aria-invalid={!upiIdValid} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />{!upiIdValid && <p className="mt-1 text-xs text-rose-600">Enter a valid UPI ID such as name@bank.</p>}</div>
              <div><label className="block text-xs font-medium mb-1">Payee name</label><input value={upiName} onChange={(e) => setUpiName(e.target.value)} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />{!upiName.trim() && <p className="mt-1 text-xs text-rose-600">Payee name is required.</p>}</div>
              <div><label className="block text-xs font-medium mb-1">Amount (optional, INR)</label><input type="text" inputMode="decimal" value={upiAmount} onChange={(e) => setUpiAmount(e.target.value)} placeholder="500.00" aria-invalid={!upiAmountValid} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />{!upiAmountValid && <p className="mt-1 text-xs text-rose-600">Use a positive amount with no more than two decimal places.</p>}</div>
              <div><label className="block text-xs font-medium mb-1">Transaction note (optional)</label><input value={upiNote} onChange={(e) => setUpiNote(e.target.value)} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" /></div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 text-xs"><strong>Verify the payee name and UPI ID in your payment app before paying.</strong><p className="mt-1 text-slate-600 dark:text-slate-400">Generated entirely in your browser. Never enter a PIN, OTP, card or bank account details here.</p></div>
              <div><span className="text-xs font-medium">Final UPI URI</span><code className="mt-1 block break-all rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-[11px]">{getQrPayload() || 'Complete the valid fields to generate.'}</code></div>
            </div>
          )}

          {/* Color & Styling Options */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              Visual Customization
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Foreground</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{bgColor}</span>
                </div>
              </div>

              {qrType !== 'barcode' && (
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Error Correction</label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview & Download Card */}
        <div className="lg:col-span-5 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-center min-h-[220px]">
            {qrType === 'barcode' ? (
              <canvas ref={barcodeCanvasRef} className="max-w-full rounded-lg" />
            ) : dataUrl ? (
              <img src={dataUrl} alt="Generated QR" className="max-w-[200px] h-auto rounded-lg" />
            ) : (
              <div className="text-xs text-slate-400">Generating code...</div>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>
            <button
              onClick={handleCopyPayload}
              className="px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              title="Copy Payload String"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono break-all line-clamp-2 max-w-full">
            Payload: {getQrPayload()}
          </div>
        </div>
      </div>
    </div>
  );
};
