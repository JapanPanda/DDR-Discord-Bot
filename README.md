# DDR-Discord-Bot
Discord bot for Dance Dance Revolution channels!

## Contributors
* JapanPanda - Developer
* erictran0x - Developer

## Features
- [X] Song Info - Gets song info (artist, composer, bpm, etc) along with the difficulty breakdowns and the corresponding note counts!
- [X] Youtube Chart Search - Provides a youtube link to a chart that is on youtube.
- [X] Song recommendation - Gives 3 songs that have charts in a certain level specified.
- [X] Rival Code - Gives a user's rival code.
- [X] Score Manager - Stores manually entered scores and sorts them by difficulty and playstyle.
- [X] News scraper - Scrapes EA Gate (official Dance Dance Revolution website) for news.
- [ ] DDR Community Rating Integration - Scrapes DDR Community for timing difficulty ratings

Have any suggestions? Create an issue on Github.

## Commands
!help - Show available commands

!who - Brief introduction about who I am

!songinfo {song name} - Lists Song information and difficulty breakdown (romaji accepted)

!chart {playstyle & difficulty example: esp} {song name} - Grabs a youtube video of the chart from Yuisin (romaji accepted)'

!newsupdate - Toggle scraping of latest DDR updates from p.eagate.573.jp

!rival {add|del|get} {handle name (add|get args. only)} {rival code (add arg. only)}

!score {add|del} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)} {score (ex: 924230) (add only)}

!scoreget {handle_space (use _ instead of spaces) (optional, default = you)} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)}

!scoreregister {DDR Handle} - Register your DDR Handle in the score manager

!suggestsong {single or double (default = singles)} {level / range} {number of suggestions (4 max & default = 1)} - Gives a song within a level'

