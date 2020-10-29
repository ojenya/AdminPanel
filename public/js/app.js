
const handler = $('.btnSend')
handler.on('click', function (e){
  e.preventDefault()
  let form = $(this).parent().serializeArray()
  let obj = {}
  for (let index = 0; index < form.length; index++) {
      obj[form[index].name] = form[index].value
  }
  $.ajax({
    type: 'POST',
    url: '/push',
    data: obj
  }).done(msg => {
    $.toast({
      heading: 'Сообщение успешно отправлено',
      text: 'При желании можете отправить еще',
      showHideTransition: 'slide',
      icon: 'success'
  })
    $('form textarea').val('');
  }
  ).fail(err => {
    console.log(err)
  })
})


