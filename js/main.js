let statsList = {
    impression_rate: "Впечатление",
    reliability_rate: "Соответствие",
    safety_rate: "Надёжность",
  };

function getData(key) {
  let data = JSON.parse(localStorage.getItem('data'));

  return data[key] || data;
}

function setData(data) {
  localStorage.setItem('data', JSON.stringify(data));
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
    , product = getData('product').find(function(el) {
        return +el.id == +item.product_id;
      })
    , children = getData('review').reduce(function(arr, current) {
        if (+current.parent_id == +item.id) arr.push(current);
        return arr;
      }, [])
    , images = getData('review_has_image').reduce(function(arr, current) {
        if (+current.review_id == +item.id) arr.push(current);
        return arr;
      }, []);

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
  
  $(Object.entries(statsList)).each(function(i, el) {
    $template.find('.reviews__review-stat').eq(i).html(el[1] + ': <b>' + item[el[0]] + '</b>');
  });

  $(children).each(function(i, el) {
    $template.append(renderReview(el));
  });

  return $template;
}

function renderReviews() {
  let wWidth = $(window).width()
    , reviews = getData('review').reduce(function(arr, current) {
      if (+current.parent_id == 0) arr.push(current);
      return arr;
    }, []);

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
  let $body = $('body');
  
  init();

  $body.on('click', '.js-reviews__review-toggle', function() {
    $(this).prev().removeClass('reviews__review-spoiler');
  });
});
function getRandomID() {
  return Math.floor(Math.random() * Math.floor(999));
}

$(function() {
  let $body = $('body');

  moment.locale('ru');
 
  $body.on('mouseenter', '.rate_field .rate__star', function() {
    let index = $(this).index()
      , $container = $(this).closest('.rate__stars');

    $container.find('.rate__star').removeClass('rate__star_active');

    for (i = 0; i < index; i++) {
      $container.find('.rate__star').eq(i).addClass('rate__star_active');
    }
  });

  $body.on('mouseleave', '.rate_field .rate__star', function() {
    let $container = $(this).closest('.rate__stars')
      , index = $container.find('input:checked').val(); 

    $container.find('.rate__star').removeClass('rate__star_active');

    for (i = 0; i < index; i++) {
      $container.find('.rate__star').eq(i).addClass('rate__star_active');
    }
  });

  $body.on('click', '.js-remove', function() {
    let $this = $(this);

    if ($this.closest('.js-files').find('.form-control').length > 1) {
        $this.closest('.row').remove();
    } else {
        $this.closest('.row').find('input').val('');
    }
  });

  $body.on('click', '.js-add', function() {
      $('.js-files').append($('#add-file-template').html());
  });

  $body.on('click', '.js-reviews__button_add', function() {
    let id = $(this).closest('.reviews__item').data('id')
      , $template = $($('#add-review-template').html());

    $template.find('[name=parent_id]').val(id);
    $template.find('.js-files').html($('#add-file-template').html());

    $('#reviewModal').find('.modal-title').text('Дополнить отзыв');
    $('#reviewModal').find('.modal-body').html($template);
    $('#reviewModal').modal('show');
  });

  $body.on('click', '.js-reviews__button_create', function() {
    let $template = $($('#create-review-template').html())
      , products = getData('product');

    $template.find('[name=parent_id]').val(0);

    $(products).each(function(i, el) {
      $template.find('[name=product_id]').append('<option value="' + el.id + '">' + el.name + '</option>');
    });

    $template.find('.js-form__rate').each(function() {
      let $rateTemplate = $($('#rate-template').html());

      $rateTemplate.find('[name=rate]').attr('name', $(this).data('attr'));
      $rateTemplate.find('.rate__star').addClass('rate__star_active');
      $rateTemplate.addClass('rate_field');
      $(this).html($rateTemplate);
    });

    $template.find('.js-files').html($('#add-file-template').html());

    $('#reviewModal').find('.modal-title').text('Оставить отзыв');
    $('#reviewModal').find('.modal-body').html($template);
    $('#reviewModal').modal('show');
  });

  $body.on('click', '.js-submit', function() {
    let hasError = false
      , data = getData()
      , review = {}
      , $form = $(this).closest('.modal').find('form');
    
    $form.find('.form-control').removeClass('is-invalid');

    $form.find('input:not([type=file]), textarea, select').each(function() {
      if ($(this).val() == '') {
        $(this).addClass('is-invalid');
        hasError = true;
      }
    });

    if (!hasError) {
      review = $form.serializeArray().reduce(function(i, obj) {
          i[obj.name] = obj.value;
          return i;
        }, {id: getRandomID()});

      review.created_at = moment().format('D MMMM, YYYY');
      review.parent_id = +review.parent_id;
      review.product_id = +review.product_id;
      
      data.review.push(review);
      
      $form.find('[type=file]').each(function() {
        if (this.files && this.files[0]) {
          let reviewHasImage = {
            id: getRandomID(),
            review_id: review.id,
            image: URL.createObjectURL(this.files[0])
           };
          
           data.review_has_image.push(reviewHasImage);
        }
      });

      setData(data);

      renderReviews();

      $('#reviewModal').modal('hide');
    }
  });
});
//# sourceMappingURL=main.js.map
