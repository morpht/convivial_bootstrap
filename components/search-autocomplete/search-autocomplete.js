(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.searchAutocomplete = {
    attach: function (context, settings) {
      const searchFormInput = $('.block-bundle-search .searchform .searchform__query', context)

      searchFormInput.once('searchFormInputFocusIn').focusin(function () {
        $(this).autocomplete({
          source: function (request, response) {
            $.getJSON("/data/autocomplete?v=" + request.term, function (data) {
              response($.map(data, function (value, key) {
                return {
                  id: value.nid,
                  title: value.title,
                  html: value.html,
                };
              }));
            });
          },
          minLength: 3,
          delay: 100,
          classes: {
            "ui-autocomplete": "global-search"
          }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {
          return $("<li>")
            .attr("data-id", item.id)
            .append(item.html)
            .appendTo(ul)
        };
      })

      searchFormInput.once('searchFormInputFocusOut').focusout(function () {
        $(this).autocomplete('destroy')
      })
    }
  };
})(jQuery, Drupal);
