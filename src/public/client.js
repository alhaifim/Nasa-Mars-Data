let store = Immutable.Map({
    currentTab: 'curiosity',
    roverInfo: {},
    roverImages: [],
})

// add our markup to the page
const root = document.getElementById('root');
const tabs= document.querySelectorAll('.tab');

const render = async (root) => {
    root.innerHTML = App(store, renderInfo, renderImages)
}
const updateStore = (key, value) => {
//    store = Object.assign(store, newState)
store = store.set(key, value) 
    render(root)
}




// App() is a higher order function-
const App = (state, renderInfo, renderImages) => {
    return generateHTML(state.get('roverInfo'), state.get('roverImages'), renderInfo, renderImages);
}

// generateHTML() is a higher order function-
const generateHTML = (roverInfo, roverImages,generateInfo,generateImage) => {
    const infoHTML= generateInfo(roverInfo);
    const imageHTML= generateImage(roverImages);
    return `
        <div>
            <div class="info-container">
                ${infoHTML}
            </div>
            <section class="image-container">
                ${imageHTML}
            </section>
        </div>
    `
}

const fetchData= async (currentTab)=>{
    await getRoverData(currentTab);
    await getRoverImages(currentTab);
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', async () => {
    init(tabs);
    await fetchData("curiosity");
    render(root);
})

const init = async (tabs)=>{
    tabs.forEach(tab => {
        tab.addEventListener('click',async e => {
            const currentTab=e.target.id;
            await updateStore('currentTab', currentTab);
            activeTab(tabs,currentTab);
            fetchData(currentTab);
        })
    });
}

const activeTab = (tabs,currentTab)=>{
    tabs.forEach(tab=>{
        if(tab.id ===currentTab){
            tab.classList.add('active')
        }else{
            tab.classList.remove('active')
        }
    })
}

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information --
const renderInfo = (info) => {
    if(!info){
        return '';
    }
    return `
        <div class="info">
            <strong>Launch Date</strong>
            <p>${info.launch_date}</p>
            <strong>Landing Date</strong>
            <p>${info.landing_date}</p>
            <strong>Max Date</strong>
            <p>${info.max_date}</p>
            <strong>Status</strong>
            <p>${info.status}</p>
            <strong>Status</strong>
            <p>${info.total_photos}</p>
            <strong>Last Date Photo taken </strong>
            <p>${info.max_earth_date}</p>
        </div>
    `
}

// This is pure function that renders images requested from the backend
const renderImages = (images) => {
    let imageHTML=``;

    images.slice(0,6).map(image => {
        imageHTML+=`
                    <figure class="image-card">
                        <img src="${image.img_src}" alt="Rover image" class="rover-image"/>
                        <figcaption>
                            <span><b>Sol (Mars days):</b> ${image.sol}</span><br/>
                            <span><b>Earth date:</b> ${image.earth_date}</span>
                        </figcaption>
                    </figure>`
    })
    return imageHTML;
}

// ------------------------------------------------------  API CALLS

const getRoverData = (roverName) => {
    return fetch(`http://localhost:9000/roverInfo`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({roverName:roverName})
    })
        .then(res => res.json())
        .then(roverInfo => updateStore('roverInfo', roverInfo))
}

const getRoverImages = (roverName) => {
    return fetch(`http://localhost:9000/fetchImage`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({roverName:roverName, earthDate: store.get('roverInfo').max_earth_date})
    })
        .then(res => res.json())
        .then(roverImages => updateStore('roverImages', roverImages ))
}