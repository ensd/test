let data = {}
  , statsList = {
    impression_rate: "Впечатление",
    reliability_rate: "Соответствие",
    safety_rate: "Надёжность",
  };

function getData(key) {
  let data = JSON.parse(localStorage.getItem("data"));

  return data[key] ?? data;
}

function setData(data) {
  localStorage.setItem("data", JSON.stringify(data));
}

function renderStatus(item, $template) {
  switch(+item.status) {
    case 0:
      $template.find('.reviews__review-status').text('На модерации').addClass('reviews__review-status_opacity');
      break;
    
    case 1:
      $template.find('.reviews__review-status').text('Опубликован');
      break;

    case 2:
      $template.find('.reviews__review-status').text('Не опубликован').addClass('reviews__review-status_muted');
      break;

    default:
      $template.find('.reviews__review-status').text('На модерации').addClass('reviews__review-status_opacity');
      break;
  }
}

function getRate(item) {
  return ((+item.impression_rate + +item.reliability_rate + +item.safety_rate) / 3).toFixed(1);
}

function renderRate(item) {
  let $template = $($('#rate-template').html())
    , value = getRate(item);

  $template.data('value', value);
  $template.find('.rate__value').text(value);

  $template.find('.rate__star').each(function(i, el) {
    let diff = value - i;

    if (diff > 1) {
      $(el).find('.rate__indicator').css('width', '100%');
    } else if (diff < 0) {
      $(el).find('.rate__indicator').css('width', '0');
    } else {
      $(el).find('.rate__indicator').css('width', (diff * 100).toFixed(0) + '%');
    }
  });

  return $template;
}

function renderPhoto(item) {
  let $template = $($('#reviews__review-image-template').html());

  $template.attr('data-lightbox', 'reviews__review-photo_' + item.review_id).attr('href', item.image);
  $template.find('.reviews__review-image').attr('src', item.image);

  return $template;
}

function renderReview(item) {
  let $template = item.parent_id ? $($('#reviews__item_child-template').html()) : $($('#reviews__item_main-template').html())
    , product = _.find(getData('product'), ['id', +item.product_id])
    , children = _.filter(getData('review'), ['parent_id', +item.id])
    , images = _.filter(getData('review_has_image'), ['review_id', +item.id]);

  $template.attr('data-id', item.id);
  $template.find('.reviews__review-text').html(item.text);
  $template.find('.reviews__review-date').html(item.created_at);
  
  renderStatus(item, $template);

  $(images).each(function(i, el) {
    $template.find('.reviews__review-images').append(renderPhoto(el));
  });

  if (+item.status == 2) {
    $template.find('.reviews__review-text').html('К сожалению, ваш отзыв не прошёл модерацию.').addClass('text-muted');
    $template.find('.reviews__review-rate, .reviews__review-stats, .js-reviews__button_add').remove();
  }

  if (item.parent_id) return $template;

  $template.find('.reviews__product-name').html(product.name);
  $template.find('.reviews__product-image').attr('src', product.image).attr('alt', product.name);
  $template.find('.reviews__review-rate').html(renderRate(item));
  
  $(_.toPairs(statsList)).each(function(i, el) {
    $template.find('.reviews__review-stat').eq(i).html(el[1] + ': <b>' + item[el[0]] + '</b>');
  });

  $(children).each(function(i, el) {
    $template.append(renderReview(el));
  });

  return $template;
}

function renderReviews() {
  let wWidth = $(window).width()
    , reviews = _.filter(getData('review'), ['parent_id', 0]);

  $('.reviews__body').html('');

  $(reviews).each(function(i, el) {
    let $html = renderReview(el);

    $('.reviews__body').append($html);
    $html.find('.reviews__review-text').each(function() {
      if ($(this).height() > (wWidth < 768 ? 120 : 60 )) $(this).addClass('reviews__review-spoiler');
    });
  });
}

function init() {
  $.getJSON('db/data.json', function(res) {

    setData(res);

    renderReviews();
  });

}

$(function() {
  var $body = $('body');
  
  init();

  $body.on('click', '.js-reviews__review-toggle', function() {
    $(this).prev().removeClass('reviews__review-spoiler');
  });
});