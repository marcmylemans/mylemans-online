# Keep tag archive pages out of sitemap.xml. There are ~350 of them and most
# hold one or two posts; category pages (18, with intros) stay in.
# The tag layout also sets <meta name="robots" content="noindex, follow">.
Jekyll::Hooks.register :site, :pre_render do |site|
  site.pages.each do |page|
    next unless page.respond_to?(:type) && page.type.to_s == "tag"
    page.data["sitemap"] = false
  end
end
