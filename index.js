"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reassemble = exports.JS = exports.CSS = exports.HTML = exports.BLOB = void 0;
exports.publish = publish;
var ndk_1 = require("@nostr-dev-kit/ndk");
var sha256_1 = require("@noble/hashes/sha256");
var utils_1 = require("@noble/hashes/utils");
// kinds
exports.BLOB = 5391;
exports.HTML = 5392;
exports.CSS = 5393;
exports.JS = 5394;
/**
 * Evidently 128kb is the default limit on many relays for event size, so we use 100kb just to be safe.
 * See discussion at https://t.me/nostr_protocol/92664
 */
var CHUNK_SIZE = 100 * 1024; // 100KB
var getTag = function (key) {
    return function (tag) {
        return tag && Array.isArray(tag) && tag[0] === key;
    };
};
/**
 * Publish a file into chunks via monkey
 * @param param0 ndk - your ndk instance
 * @param param1 file - the file to split into chunks
 * @param param2 OPTIONAL tags - customize the tags for the chunk events
 * @param param3 OPTIONAL attach - specify an event id to attach this event to. This makes it easy to query for {"#e"->attach, kind: 5391} and
 * @param param4 description - an alt description of the file
 * @param param5 chunkSize - custom chunk size in bytes. Default is 100kb
 */
function publish(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var published, reader_1;
        var _this = this;
        var ndk = _b.ndk, file = _b.file, tags = _b.tags, attach = _b.attach, description = _b.description, chunkSizeBytes = _b.chunkSizeBytes;
        return __generator(this, function (_c) {
            published = [];
            try {
                reader_1 = new FileReader();
                reader_1.readAsDataURL(file);
                reader_1.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, mime, base64, chunks, hash;
                    var _this = this;
                    return __generator(this, function (_b) {
                        if (!reader_1.result) {
                            throw new Error('Could not read file.');
                        }
                        _a = reader_1.result.split(','), mime = _a[0], base64 = _a[1];
                        chunks = chunkPayload(base64, chunkSizeBytes);
                        hash = getFileHash(base64);
                        chunks.forEach(function (chunk, index) { return __awaiter(_this, void 0, void 0, function () {
                            var ndkEvent;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        ndkEvent = new ndk_1.NDKEvent(ndk);
                                        ndkEvent.kind = exports.BLOB;
                                        ndkEvent.content = chunk;
                                        if (attach) {
                                            ndkEvent.tags.push(['e', attach, (ndk === null || ndk === void 0 ? void 0 : ndk.explicitRelayUrls) ? ndk === null || ndk === void 0 ? void 0 : ndk.explicitRelayUrls[0] : "", "root"]);
                                        }
                                        if (tags) {
                                            (_a = ndkEvent.tags).push.apply(_a, tags);
                                        }
                                        ndkEvent.tags.push(['m', mime]);
                                        if (description) {
                                            ndkEvent.tags.push(['alt', description]);
                                        }
                                        ndkEvent.tags.push(['index', index.toString()]);
                                        ndkEvent.tags.push(['x', hash]);
                                        return [4 /*yield*/, ndkEvent.publish()];
                                    case 1:
                                        _b.sent();
                                        published.push(ndkEvent);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                    });
                }); };
            }
            catch (e) {
                console.error(e);
            }
            return [2 /*return*/, published];
        });
    });
}
var getFileHash = function (base64) {
    // get the hash of the file; this serves as an identifier for the file
    var plaintext = atob(base64);
    // console.log('plaintext',plaintext) // the file is intact!
    var binarytext = (new TextEncoder()).encode(plaintext);
    var hash = (0, utils_1.bytesToHex)((0, sha256_1.sha256)(binarytext));
    return hash;
};
// Split a file into chunks 
var chunkPayload = function (base64, customChunkSize) {
    var chunkSize = CHUNK_SIZE;
    if (customChunkSize)
        chunkSize = customChunkSize;
    var chunks = [];
    var offset = 0;
    while (offset < base64.length) {
        var chunk = base64.slice(offset, offset + chunkSize);
        chunks.push(chunk);
        offset += chunkSize;
    }
    return chunks;
};
/**
 * reassemble assets from chunks
 * @param param0 events - The returned Set from an NDK .fetchEvents() call for a group of chunks. You can pass multiple groups for different files into this function and it will return each file as a separate entry in the output object.
 * Returns an object of {"mime:hash" -> decoded plaintext file string}. The mime is provided for convenience to identify the kind of file.
 *
 */
var reassemble = function (events) {
    var _a, _b, _c;
    // Group events by hash and mime
    var groups = {};
    for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
        var event_1 = events_1[_i];
        if (!event_1)
            continue;
        var hash = (_a = event_1.tags.find(getTag('x'))) === null || _a === void 0 ? void 0 : _a[1];
        var mime = (_b = event_1.tags.find(getTag('m'))) === null || _b === void 0 ? void 0 : _b[1];
        var unique = "".concat(mime, ":").concat(hash);
        var group = (_c = groups[unique]) !== null && _c !== void 0 ? _c : [];
        group.push(event_1);
        groups[unique] = group;
    }
    // Sort events within each group by index
    for (var _d = 0, _e = Object.values(groups); _d < _e.length; _d++) {
        var group = _e[_d];
        group.sort(function (a, b) { return parseInt(a.tags.find(getTag('index'))[1]) - parseInt(b.tags.find(getTag('index'))[1]); });
    }
    // Stitch chunks together within each group
    var result = {};
    for (var _f = 0, _g = Object.entries(groups); _f < _g.length; _f++) {
        var _h = _g[_f], unique = _h[0], group = _h[1];
        var chunks = group.map(function (event) { return atob(event.content); });
        result[unique] = chunks.join('');
    }
    return result;
};
exports.reassemble = reassemble;
