using System.Text.Json.Serialization;

namespace LingCat.ClientProtocol.Client;

[JsonSerializable(typeof(Dictionary<string, string>))]
internal partial class MessageParserJsonContext : JsonSerializerContext;
