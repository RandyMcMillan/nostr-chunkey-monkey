[![dataurl build status on GNU/Linux](https://github.com/Y2Z/dataurl/workflows/GNU%2FLinux/badge.svg)](https://github.com/Y2Z/dataurl/actions?query=workflow%3AGNU%2FLinux)
[![dataurl build status on macOS](https://github.com/Y2Z/dataurl/workflows/macOS/badge.svg)](https://github.com/Y2Z/dataurl/actions?query=workflow%3AmacOS)
[![dataurl build status on Windows](https://github.com/Y2Z/dataurl/workflows/Windows/badge.svg)](https://github.com/Y2Z/dataurl/actions?query=workflow%3AWindows)

# dataurl

CLI tool / Rust crate for converting files and text into data URLs and back


---------------------------------------------------


## Usage (CLI)

```console
dataurl "some text"
```

```console
dataurl -d 'data:text/html,text<a id%3D"b">ok</a>?a=v#f' > index.html
```

```console
dataurl -b -i picture.png
```

```console
cat file.txt | dataurl -i - -o - | dataurl -d
```

```console
cat file.png | dataurl
```

### Flags and options

 - `-b`: Encode data using base64
 - `-c`: Use custom `charset`
 - `-d`: Attempt to parse input, output resulting data
 - `-f`: Append `fragment`
 - `-i`: Specify `file` to read data from (use `-` for STDIN)
 - `-o`: Provide `file` to write output to (use `-` for STDOUT)
 - `-t`: Adjust `media type`


---------------------------------------------------


## Usage (crate)

```rust
use dataurl::DataUrl;

let data_url: DataUrl = DataUrl::parse("data:,Hello,%20World!")?;

assert_eq!(data_url.media_type(), "text/plain".to_string());
assert_eq!(data_url.media_type_no_default(), None);
assert_eq!(data_url.charset(), "US-ASCII".to_string());
assert_eq!(data_url.charset_no_default(), None);
assert!(!data_url.is_base64_encoded());
assert_eq!(data_url.data(), [72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]);
assert_eq!(data_url.fragment(), None);
assert_eq!(data_url.to_string(), "data:,Hello%2C%20World%21");
assert_eq!(data_url.text(), "Hello, World!");
```


---------------------------------------------------


## Installation

#### Using [Cargo](https://crates.io/crates/dataurl)

```console
cargo install dataurl
```

#### Using [containers](https://www.docker.com/)

```console
docker build -t Y2Z/dataurl .
sudo install -b dist/run-in-container.sh /usr/local/bin/dataurl
```

#### From source

```console
git clone https://github.com/Y2Z/dataurl.git
cd dataurl
make install
```

#### Using [pre-built binaries](https://github.com/Y2Z/dataurl/releases) (Windows, ARM-based devices, etc)

Every release contains pre-built binaries for Windows, GNU/Linux, as well as platforms with non-standart CPU architecture.


---------------------------------------------------


## References

 - [RFC 2397 (The "data" URL scheme)](https://datatracker.ietf.org/doc/html/rfc2397)
 - [RFC 6838 (Media Type Specifications and Registration Procedures)](https://datatracker.ietf.org/doc/html/rfc6838)


---------------------------------------------------


## License

To the extent possible under law, the author(s) have dedicated all copyright related and neighboring rights to this software to the public domain worldwide.
This software is distributed without any warranty.

# Chunkey Monkey

![Chunkey Monkey](chunkeymonkey.png)

Publish large files to nostr as chunks and reassemble them with ease!

> [!IMPORTANT]
> This package requires the usage of [NDK](https://github.com/nostr-dev-kit/ndk#installation)

## Install

``` bash
$ yarn add nostr-chunkey-monkey
```

## Usage

``` javascript
import { publish, reassemble } from 'nostr-chunkey-monkey'

// get the file from the input[type=file] element
const files = uploadElement.files
// if the input has the multiple attribute, it can handle multiple files at once

// optional custom tags
const customTags = [
  ["whatever", "you want"],
  ["do it", "like this"],
  ["monkey", "🐒🍌"],
]

// optional hex event id to attach the chunks to
const attachToEvent = "0fbc395a..." 

const allChunks = []

for (const file of files) {
  const publishedFileChunks = await publish({ndk, file, tags: customTags, attach: attachToEvent })

  // Display the SHA256 hash of the file. This will be the same for every chunk, so you can use it as the identifier of the group of chunks.
  // You can filter a relay query for the x tag to grab all the chunks.
  let hash = publishedFileChunks[0].tags.find( t => t[0] === 'x')[1] 
  console.log(hash)

  allChunks.push(...publishedFileChunks)

}

// reassemble the files, even multiple different files at a time, by passing chunk events into reassemble()

const reassembledFiles = reassemble(allChunks)

console.log(reassembledFiles) // {"<mimetype>:<hash>": "plaintext file contents", ...}

```
