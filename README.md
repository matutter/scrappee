==================
SCRAPPEE
==================
A simple web-scraper cmd line tool.


Usage:
-url, -u              Base url      - 

-url-sequence,        Url sequence  - Comma separated list of urls to replace
-url-seq, -us                         the {} identifier in the base url.

'-selectors, -s,      Selector list - Comma separated list of selectors.
-select, -sel                         Selectors may contain the following syntax
                                      $<key>=<selector> to allow methods of the 
                                      parse module to be called by the <key>.
                                      The query objects produced will have a data
                                      property which contains the parsed or unparsed 
                                      data in the same way; query.data.<key> = <data>
                                      Without the selector key syntax content in 
                                      placed by orginality and may be accessed via
                                      query[<index>].

-parse-module,        Parse module  - nodejs module which will be loaded to parse
-parse-mod, -pm                       text from the website's content.
                                      Module contract below.


__Parse Module Contract__
The selector list syntax $<key>=<selector> allows exports from the parse-module
to be used to work on the text of the selected content. 

```javascript
module.exports.<key> = function(text) { return text }
```