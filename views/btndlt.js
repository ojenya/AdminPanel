const btn = document.querySelectorAll('.dlt')

for (let i = 0; i < btn.length; i++) {
    btn[i].addEventListener('click', function() {
        const id = this.getAttribute('data-id')

        fetch('http://localhost:4000/delete', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
    })
}