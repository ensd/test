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