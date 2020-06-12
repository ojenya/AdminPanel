
const handler = $('.btnSend')
handler.on('click', function (e){
  e.preventDefault()
  let form = $(this).parent().serializeArray()
  let obj = {}
  for (let index = 0; index < form.length; index++) {
    // for (let key in form[index]) {
      // console.log({name:form[key].name, value:form[key].value})
      obj[form[index].name] = form[index].value
    // }
  }
  $.ajax({
    type: 'POST',
    url: '/telegram',
    data: obj
  }).done(msg => {
    $.toast({
      heading: 'Сообщение успешно отправлено',
      text: 'При желании можете отправить еще',
      showHideTransition: 'slide',
      icon: 'success'
  })
    $('form input[name="group"], form textarea').val('');
  }
  ).fail(err => {
    console.log(err)
  })
})


const add = $('.add')
add.on('click', function (e){
  e.preventDefault()
  let form = $(this).parent().serializeArray()
  let obj = {}
  for (let index = 0; index < form.length; index++) {
      obj[form[index].name] = form[index].value
  }

if(obj.group !== '' && obj.course !== ''){
  $.ajax({
    type: 'POST',
    url: '/course/',
    data: obj
  }).done(msg => {
    $.toast({
      heading: 'Группа успешно добавлена',
      showHideTransition: 'slide',
      icon: 'success'
  })
  location.reload(true);
  }).fail(err => {
    console.log(err)
  })
}else{
  $.toast({
    heading: 'Группа не добавлена',
    showHideTransition: 'slide',
    text:'Нужно заполнить оба поля',
    icon: 'error'
})
}
})

