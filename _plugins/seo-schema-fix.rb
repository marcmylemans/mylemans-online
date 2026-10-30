# jekyll-seo-tag emits "@type":"imageObject" (wrong case, schema.org is
# case-sensitive) and an "alt" key that is not a schema.org property.
# Both show up as validation errors in Ahrefs / Google. Patch the rendered
# JSON-LD after each page is rendered.
Jekyll::Hooks.register [:documents, :pages], :post_render do |doc|
  next unless doc.output && doc.output.include?('"@type":"imageObject"')
  doc.output = doc.output
    .gsub('"@type":"imageObject"', '"@type":"ImageObject"')
    .gsub(/"image":\{"alt":("(?:[^"\\]|\\.)*"),/, '"image":{"caption":\1,')
end
