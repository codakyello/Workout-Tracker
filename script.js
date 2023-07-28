'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let coords;
let map;

class Workout {
  constructor(coords, distance, duration, id) {
    // Object and then a link to its protytypes this is what makes a class
    this.coords = coords;
    this.date = new Date();
    this.id = (Date.now() + '').slice(-5);
    this.distance = distance;
    this.duration = duration;
  }

  saveWorkout() {
    let workouts = [];
    if (Workout.getWorkouts()) {
      workouts = Workout.getWorkouts();
    }
    workouts.push(this);
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }

  static getWorkouts() {
    // Communicate to local storage and get all workouts

    const workouts = JSON.parse(localStorage.getItem('workouts'));
    if (!workouts) return [];
    return workouts;
  }

  setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    // Joins the properties of the parent objects
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = 'running';
    this.calcPace();
    this.setDescription();
  }

  calcPace() {
    // min/km
    this.pace = (this.duration / this.distance).toFixed(2);
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.type = 'cycling';
    this.calcSpeed();
    this.setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = (this.distance / this.duration / 60).toFixed(2);
    return this.speed;
  }
}

const renderMarkers = function (workouts) {
  workouts.forEach(workout => {
    L.marker(workout.coords)
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  });
};
const renderWorkouts = function (workouts) {
  const workoutsEl = document.querySelectorAll('.workout');
  workoutsEl.forEach(el => {
    el.style.display = 'none';
  });

  workouts.forEach(workout => {
    let html;
    if (workout.type === 'running') {
      html = `<li class="workout workout--running" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">🏃‍♂️</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
          </li>`;
    }
    if (workout.type === 'cycling') {
      html = `
          <li class="workout workout--cycling" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">🚴‍♀️</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.speed}</span>
              <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${workout.elevation}</span>
              <span class="workout__unit">m</span>
            </div>
          </li> `;
    }

    form.insertAdjacentHTML('afterend', html);
  });
};

//Promisifying get Position
const getPosition = function () {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      data => {
        resolve(data);
      },
      err => {
        reject(err);
      }
    );
  });
};

const loadMap = async function () {
  try {
    const pos = await getPosition();
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    console.log(latitude, longitude);
    map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const workouts = Workout.getWorkouts();
    renderWorkouts(workouts);
    renderMarkers(workouts);

    function onMapClick(e) {
      form.classList.remove('hidden');
      const { lat, lng } = e.latlng;
      coords = [lat, lng];
    }
    map.on('click', onMapClick);
  } catch (e) {
    console.log(e);
  }
};

loadMap();

// renderWorkout(Workout.getWorkouts());

inputType.addEventListener('change', e => {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});

form.addEventListener('submit', e => {
  e.preventDefault();
  // Validator
  const distance = +inputDistance.value;
  const duration = +inputDuration.value;

  if (inputType.value.toLowerCase() === 'cycling') {
    const elevation = +inputElevation.value;
    if (!validate(distance, duration, elevation))
      return alert('All inputs must be Positive');

    new Cycling(coords, distance, duration, elevation).saveWorkout();
  }

  if (inputType.value.toLowerCase() === 'running') {
    console.log(inputType.value);
    const cadence = +inputCadence.value;

    if (!validate(distance, duration, cadence))
      return alert('All inputs must be Positive');

    new Running(coords, distance, duration, cadence).saveWorkout();

    // Render the workouts cards and also use the lat and long to put some markers on the map
  }

  form.classList.add('hidden');
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';

  const workouts = Workout.getWorkouts();
  renderWorkouts(workouts);
  renderMarkers(workouts);

  //   renderWorkout(workouts);
});

containerWorkouts.addEventListener('click', e => {
  if (!map) return;
  const clicked = e.target.closest('.workout');
  if (clicked) {
    // Cross reference this id with our list of Workouts to get a match
    const workout = Workout.getWorkouts().find(
      workout => workout.id === clicked.dataset.id
    );
    map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
});

const validate = function (...numbers) {
  // Check if they are numbers and positive numbers
  return numbers.every(number => typeof number === 'number' && number > 0);
};
