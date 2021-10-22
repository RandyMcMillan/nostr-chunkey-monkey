use encoding_rs::Encoding;
use percent_encoding::{percent_decode_str, utf8_percent_encode, NON_ALPHANUMERIC};
use std::fmt;
use url::Url;

const DEFAULT_MEDIA_TYPE: &'static str = "text/plain";
const DEFAULT_CHARSET: &'static str = "US-ASCII";

// TODO: add support for other optional parameters besides charset (filename, etc)
pub struct DataUrl {
    media_type: Option<String>, // Mime type
    charset: Option<String>,    // US-ASCII is default, according to the spec
    is_base64_encoded: bool,    // Indicates if it's a base64-encoded data URL
    data: Vec<u8>,              // Data, bytes
    fragment: Option<String>,   // #something-at-the-end, None by default
}

pub enum DataUrlParseError {
    UrlParseError,
    MalformedDataUrlError,
    Base64DecodeError,
}

impl fmt::Debug for DataUrlParseError {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        fmt.debug_struct("DataUrlParseError").finish()
    }
}

fn validate_media_type(input: &str) -> bool {
    // Must contain one slash
    input.split('/').collect::<Vec<&str>>().len() == 2
}

fn parse_data_url_meta_data(meta_data_string: String) -> (Option<String>, Option<String>, bool) {
    let mut media_type: Option<String> = None;
    let mut charset: Option<String> = None;
    let mut is_base64_encoded: bool = false;

    // Parse meta data
    let content_type_items: Vec<&str> = meta_data_string.split(';').collect();
    let mut i: i8 = 0;
    for item in &content_type_items {
        // Media type has to always come first in data URLs
        if i == 0 {
            if item.trim().len() > 0 && validate_media_type(item) {
                media_type = Some(item.trim().to_lowercase().to_string());
            }
        } else {
            if !is_base64_encoded && item.trim().to_lowercase().starts_with("charset=") {
                // only the first occurence of charset counts
                if charset.is_none() {
                    if let Some(e) = Encoding::for_label_no_replacement((&item[8..]).as_bytes()) {
                        charset = Some(e.name().to_string());
                    }
                }
            } else if item.trim().eq_ignore_ascii_case("base64") {
                is_base64_encoded = true;
            }
        }

        i += 1;
    }

    (media_type, charset, is_base64_encoded)
}

impl DataUrl {
    pub fn new() -> DataUrl {
        DataUrl {
            media_type: None,
            charset: None,
            is_base64_encoded: false,
            data: [].to_vec(),
            fragment: None,
        }
    }

    // TODO: rename to from_string/from_str/from — look for how it's done for String and similar
    pub fn parse(input_str: &str) -> Result<Self, DataUrlParseError> {
        match Url::parse(input_str) {
            Ok(url) => {
                let path: String = url.path().to_string();
                if let Some(comma_offset) = path.find(',') {
                    let fragment: Option<&str> = url.fragment();

                    // Parse meta data
                    let meta_data_string = String::from(&path[..comma_offset]);
                    let (media_type, charset, is_base64_encoded) =
                        parse_data_url_meta_data(meta_data_string);

                    // Parse raw data into vector of bytes
                    let mut data_string: String = percent_decode_str(&path[comma_offset + 1..])
                        .decode_utf8_lossy()
                        .to_string();
                    if let Some(query) = url.query() {
                        data_string += "?";
                        data_string += &percent_decode_str(&query).decode_utf8_lossy().to_string();
                    }
                    let mut unable_to_decode_base64: bool = false;
                    let blob: Vec<u8> = if is_base64_encoded {
                        match base64::decode(&data_string) {
                            Ok(decoded) => decoded,
                            Err(_) => {
                                unable_to_decode_base64 = true;
                                [].to_vec()
                            }
                        }
                    } else {
                        data_string.as_bytes().to_vec()
                    };

                    if unable_to_decode_base64 {
                        return Err(DataUrlParseError::Base64DecodeError);
                    }

                    Ok(DataUrl {
                        media_type: media_type,
                        charset: charset,
                        is_base64_encoded: is_base64_encoded,
                        data: blob,
                        fragment: if let Some(f) = fragment {
                            Some(f.to_string())
                        } else {
                            None
                        },
                    })
                } else {
                    Err(DataUrlParseError::MalformedDataUrlError)
                }
            }
            Err(_) => Err(DataUrlParseError::UrlParseError),
        }
    }

    pub fn get_media_type(&self) -> &str {
        if let Some(mt) = &self.media_type {
            mt
        } else {
            DEFAULT_MEDIA_TYPE
        }
    }

    pub fn get_media_type_no_default(&self) -> Option<String> {
        if let Some(mt) = &self.media_type {
            Some(mt.to_string())
        } else {
            None
        }
    }

    pub fn set_media_type(&mut self, new_media_type: Option<String>) -> bool {
        if let Some(mt) = new_media_type {
            if mt.trim().len() > 0 && validate_media_type(&mt) {
                self.media_type = Some(mt.to_string());
                true
            } else {
                // Empty media type makes it fall back to default (text/plain)
                self.media_type = None;
                false
            }
        } else {
            self.media_type = None;
            true
        }
    }

    pub fn get_charset(&self) -> &str {
        if let Some(c) = &self.charset {
            c
        } else {
            DEFAULT_CHARSET
        }
    }

    pub fn get_charset_no_default(&self) -> Option<String> {
        if let Some(c) = &self.charset {
            Some(c.to_string())
        } else {
            None
        }
    }

    pub fn set_charset(&mut self, new_charset: Option<String>) -> bool {
        if let Some(c) = new_charset {
            // Validate the input
            if let Some(e) = Encoding::for_label_no_replacement(c.as_bytes()) {
                self.charset = Some(e.name().to_string());
                true
            } else {
                // Since browsers fall back to US-ASCII, so do we
                self.charset = None;
                false
            }
        } else {
            self.charset = None;
            true
        }
    }

    // TODO: ditch get/set_is_base64_encode and implement two separate functions, to_precent_encoded_string, and to_base64_encoded_string?
    // TODO: ^ if taken that path, should was_input_base64_encoded() added, None by default, Option<bool> after parse() is used, added?

    pub fn get_is_base64_encoded(&self) -> bool {
        self.is_base64_encoded
    }

    pub fn set_is_base64_encoded(&mut self, new_is_base64_encoded: bool) {
        self.is_base64_encoded = new_is_base64_encoded;
    }

    pub fn get_data(&self) -> &[u8] {
        &self.data
    }

    pub fn get_text(&self) -> String {
        // This can never really fail
        if let Some(encoding) = Encoding::for_label(
            self.charset
                .as_ref()
                .unwrap_or(&DEFAULT_CHARSET.to_string())
                .as_bytes(),
        ) {
            let (decoded, _, _) = encoding.decode(&self.data);
            decoded.to_string()
        } else {
            "".to_string()
        }
    }

    // TODO
    // pub fn set_text(&self, Option<String>) {
    // }

    pub fn set_data(&mut self, new_data: &[u8]) {
        self.data = new_data.to_vec();
    }

    pub fn get_fragment(&self) -> Option<String> {
        if let Some(f) = &self.fragment {
            Some(f.to_string())
        } else {
            None
        }
    }

    pub fn set_fragment(&mut self, new_fragment: Option<String>) {
        self.fragment = new_fragment;
    }

    // TODO: rename it to as_str/to_str, make it return a &str instead of String
    // TODO: make it an Option(Result?), throw error in case is_base64_encoded=false, and charset!=default|utf8
    pub fn to_string(&self) -> String {
        let mut result: String = "data:".to_string();

        if let Some(mt) = &self.media_type {
            result += &mt;
        }

        if let Some(c) = &self.charset {
            // windows-1252 is another name for US-ASCII, the default charset in data URLs
            if c != "windows-1252" {
                result += ";charset=";
                result += &c;
            }
        }

        if self.is_base64_encoded {
            result += ";base64,";
            if self.data.len() > 0 {
                // This can never fail
                if let Some(encoding) = Encoding::for_label(
                    self.charset
                        .as_ref()
                        .unwrap_or(&DEFAULT_CHARSET.to_string())
                        .as_bytes(),
                ) {
                    let (decoded, _, _) = encoding.decode(&self.data);
                    result += &base64::encode(&decoded.as_bytes());
                }
            }
        } else {
            result += ",";
            if self.data.len() > 0 {
                result +=
                    &utf8_percent_encode(&String::from_utf8_lossy(&self.data), NON_ALPHANUMERIC)
                        .to_string();
            }
        }

        if let Some(f) = &self.fragment {
            result += "#";
            result += &utf8_percent_encode(f, NON_ALPHANUMERIC).to_string();
        }

        result
    }
}