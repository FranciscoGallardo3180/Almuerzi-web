let mealState = [];
let user = [];
let ruta = 'login'//login,register,orders


const stringToHtml = (s) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(s, 'text/html');
    return doc.body.firstChild;
}

const renderItem = (item) => {
    const element = stringToHtml(`<li data-id="${item._id}">${item.name}</li>`);

    //escuchador de eventos

    element.addEventListener('click', () => {
        const mealList = document.getElementById('meals-list');
        Array.from(mealList.children).forEach(x => x.classList.remove('selected'));
        element.classList.add('selected');
        //obtener id de meals
        const mealsIdInput = document.getElementById('meals-id');
        mealsIdInput.value = item._id;
    })

    return element;
}

const inicializaFormulario = () => {
    const orderForm = document.getElementById('order');
    orderForm.onsubmit = (e) => {
        e.preventDefault();
        const submit = document.getElementById('submit');
        submit.setAttribute('disabled', true);
        const mealId = document.getElementById('meals-id');
        const mealIdValue = mealId.value;

        if (!mealIdValue) {
            alert('Debe seleccionar un plato');
            submit.removeAttribute('disabled');
            return;
        }

        const order = {
            meal_id: mealIdValue,
            user_id: user._id,
        }

        fetch('https://serverless-franiscogallardo-gmailcom.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order)
        }).then(x => x.json())
            .then(respuesta => {
                const renderdOrder = renderOrder(respuesta, MealsState);
                const ordersList = document.getElementById('orders-list');
                ordersList.appendChild(renderdOrder);
                submit.removeAttribute('disabled');
                return
            });
    }

}

const inicializaDatos = () => {
    fetch('https://serverless-franiscogallardo-gmailcom.vercel.app/api/meals')
        .then(response => response.json())
        .then(data => {
            MealsState = data;
            const mealList = document.getElementById('meals-list');
            const submit = document.getElementById('submit');
            const listItems = data.map(renderItem);
            mealList.removeChild(mealList.firstElementChild);
            listItems.forEach(element => mealList.appendChild(element));

            submit.removeAttribute('disabled')

            fetch('https://serverless-franiscogallardo-gmailcom.vercel.app/api/orders')
                .then(response => response.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders-list');
                    const listOrders = ordersData.map(ordersData => renderOrder(ordersData, data))

                    ordersList.removeChild(ordersList.firstElementChild)
                    listOrders.forEach(element => ordersList.appendChild(element));

                });
        });
}
const renderOrder = (order, meals) => {
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHtml(`<li data-id="${order._id}">${meal.name}- ${order.user_id}</li>`);
    return element;
}

const renderApp = () =>{
    const token = localStorage.getItem('token')
    if(token){
        user = JSON.parse(localStorage.getItem('user'))
        renderOrders()
    }
    renderLogin()
}

const renderOrders = () =>{
    
    const ordersView = document.getElementById('orders-views');
    document.getElementById('app').innerHTML = ordersView.innerHTML
    

    inicializaFormulario();
    inicializaDatos();
}

const renderLogin = () =>{
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML
   

    const loginForm = document.getElementById('login-form');
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        fetch('https://serverless-franiscogallardo-gmailcom.vercel.app/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
            
        }).then(x => x.json())
        .then(respuesta => {
            localStorage.setItem('token',respuesta.token)
            ruta ='orders'
            return respuesta.token
            //renderOrders()
        })
        .then(token =>{
            //http://localhost:3000
            return fetch('https://serverless-franiscogallardo-gmailcom.vercel.app/api/auth/me',{
                method:'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'authorization':token,

                },
            })
            .then(x=> x.json())
            .then(fetchedUser =>{
                localStorage.setItem('user',JSON.stringify(fetchedUser))
                user =fetchedUser
                renderOrders()
            })

        })

    }
}

window.onload = () => {
    renderApp()
    
}

