require 'json'

module Jekyll
  class SearchData < StaticFile
    def write(dest)
        begin
            super(dest)
        rescue
        end
        true
    end
  end

  class SearchGenerator < Generator
    EXCLUDE = ["Not found", "Internal Server Error", "Blog Archive", "store_bak", "Contact", "Search"]
    
    def generate(site)
      @search_array = []
      search_posts(site)
      search_pages(site)
      file = File.new(File.join(site.dest, "search.json"), "w")
      file.write(JSON.pretty_generate(@search_array))
      file.close
      site.static_files << Jekyll::SearchData.new(site, site.dest, "/", "search.json")
    end

		# TAKEN FROM CATEGORY_GENERATOR.RB in PLUGINS
		#
    # Outputs a list of categories as comma-separated <a> links. This is used
    # to output the category list for each post on a category page.
    #
    #  +categories+ is the list of categories to format.
    #
    # Returns string
    #
    def category_links(categories)
      categories = categories.sort!.map { |c| category_link c }

      case categories.length
      when 0
        ""
      when 1
        categories[0].to_s
      else
        "#{categories[0...-1].join(', ')}, #{categories[-1]}"
      end
    end

		# TAKEN FROM CATEGORY_GENERATOR.RB in PLUGINS
		#
    # Outputs a single category as an <a> link.
    #
    #  +category+ is a category string to format as an <a> link
    #
    # Returns string
    #
    def category_link(category)
      "<a class='category' href='/blog/categories/#{category.to_url}/'>#{category}</a>"
    end

		# TAKEN FROM TAG_GENERATOR.RB in PLUGINS!!
		#
    # Outputs a list of tags as comma-separated <a> links. This is used
    # to output the tag list for each post on a tag page.
    #
    #  +tags+ is the list of tags to format.
    #
    # Returns string
    #
    def tag_links(tags)
      dir = 'tags'
      tags = tags.sort!.map do |item|
        "<a class='tag' href='/#{dir}/#{item.to_url}/'>#{item}</a>"
      end

      case tags.length
      when 0
        ""
      when 1
        tags[0].to_s
      else
        "#{tags[0...-1].join(', ')}, #{tags[-1]}"
      end
    end

    def search_posts(site)
      site.posts.each_with_index do |post, i|
        @search_array << {
        id: i,
        title: post.data["title"],
        category: category_links(post.categories),
        tags: tag_links(post.tags),
        url: post.url,
        content: post.content,
        date: {
          year: post.date.strftime("%Y"),
          month: post.date.strftime("%B"),
          day: post.date.strftime("%d")
        }
        }
      end
    end

    def search_pages(site)
      site.pages.each_with_index do |page, i|
        if page.data["title"]
          unless EXCLUDE.include? page.data["title"]
            @search_array << {
            id: i,
            title: page.data["title"],
            url: page.url,
            content: page.content
            } unless (page.url == "/index.html" or page.url.include? ".xml")
          end
        end
      end
    end
    
  end
end
