# Pop.tg URL shortener

## About <a name = "about"></a>

A simple, easy-to-use and free URL shortener built with cf-worker.

## Project Structure

`backend`: Legacy V1 API, not using or deployed anymore

`frontend`: www.pop.tg frontend, built using svelte

`v2api`: V2 API, naive RPC-like syntax for various method call, deployed on Cloudflare Workers

## TODO

_Maybe_ a CLI written in Rust, not sure yet

_Maybe_ `Namespace` ( e.g. https://pop.tg/MyName/key ), but that would require a user registration system, which I'm not too lazy to implement
