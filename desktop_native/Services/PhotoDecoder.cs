using Aprillz.MewUI.Resources;
using SkiaSharp;

namespace LingCat_Desktop.Services;

internal sealed class PhotoDecoder : IImageDecoder
{
    public string Id => "lingcat-photo";

    public bool CanDecode(ReadOnlySpan<byte> encoded) =>
        encoded.StartsWith("GIF87a"u8) || encoded.StartsWith("GIF89a"u8) ||
        (encoded.Length >= 12 && encoded.StartsWith("RIFF"u8) && encoded[8..].StartsWith("WEBP"u8));

    public unsafe bool TryDecode(ReadOnlySpan<byte> encoded, out Bgra32PixelBuffer bitmap)
    {
        bitmap = default;
        if (!CanDecode(encoded)) return false;

        fixed (byte* input = encoded)
        {
            using var data = SKData.Create((nint)input, encoded.Length);
            using var codec = SKCodec.Create(data);
            if (codec is null) return false;

            var source = codec.Info;
            // Match the built-in decoder's allocation guard; this is separate from upload limits.
            if (source.Width is <= 0 or > 32768 || source.Height is <= 0 or > 32768 ||
                (long)source.Width * source.Height > 64L * 1024 * 1024)
                return false;

            bool hasAlpha = source.AlphaType != SKAlphaType.Opaque;
            var info = new SKImageInfo(source.Width, source.Height, SKColorType.Bgra8888,
                hasAlpha ? SKAlphaType.Unpremul : SKAlphaType.Opaque);
            var pixels = new byte[info.BytesSize];
            fixed (byte* output = pixels)
            {
                // The default codec options decode frame zero, including its canvas placement.
                if (codec.GetPixels(info, (nint)output) != SKCodecResult.Success) return false;
            }

            bitmap = new Bgra32PixelBuffer(info.Width, info.Height, pixels, hasAlpha);
            return true;
        }
    }
}
