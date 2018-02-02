"use strict";

let restaurants;
let map;
let markers = [];

const observer = lozad(); // lazy loads elements with default selector as '.lozad'

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  fillRestaurantsHTML();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
    .then(neighborhoods => {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    })
    .catch(error => {
      alert(error);
    });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById("neighborhoods-select");
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement("option");
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines()
    .then(cuisines => {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    })
    .catch(error => {
      alert(error);
    });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById("cuisines-select");

  cuisines.forEach(cuisine => {
    const option = document.createElement("option");
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

const openMap = () => {
  const gmap = document.getElementById("map");
  gmap.style.height = "400px";
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const gmap = document.getElementById("map");
  gmap.onclick = null;

  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  self.markers = [];

  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  DBHelper.fetchRestaurants()
    .then(restaurants => {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    })
    .catch(error => {
      console.log("updateRestaurants", error);
    });

  const cSelect = document.getElementById("cuisines-select");
  const nSelect = document.getElementById("neighborhoods-select");

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
    .then(restaurants => {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    })
    .catch(error => {
      alert(error);
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById("restaurants-list");
  ul.innerHTML = "";

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById("restaurants-list");
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = restaurant => {
  DBHelper.addRestaurantToDb(restaurant);
  const li = document.createElement("li");
  li.className = "card";

  const image = document.createElement("img");
  image.className = "restaurant-img lozad";
  image.setAttribute("alt", `An image of ${restaurant.name}`);
  image.setAttribute("data-src", DBHelper.thumbSrcForRestaurant(restaurant));
  li.append(image);

  const name = document.createElement("h4");
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement("p");
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement("p");
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement("a");
  more.className = "btn";
  more.innerHTML = "View Details";
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.id = `favcheckbox-${restaurant.id}`;

  if (restaurant.is_favorite == "true") {
    input.checked = restaurant.is_favorite;
  } else {
    input.removeAttribute("checked");
  }

  input.setAttribute("name", `plain-${restaurant.id}`);
  input.onclick = favResto(restaurant.id);

  const label = document.createElement("label");
  label.setAttribute("for", `plain-${restaurant.id}`);

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "state p-success-o";

  const icon = document.createElement("i");
  icon.className = "icon mdi mdi-heart";

  iconWrapper.appendChild(icon);
  iconWrapper.appendChild(label);

  const favCheck = document.createElement("div");
  favCheck.className = "pretty p-icon p-round p-plain p-smooth";
  favCheck.appendChild(input);
  favCheck.appendChild(iconWrapper);

  li.append(favCheck);

  setTimeout(() => {
    observer.observe();
  }, 0);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, "click", () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
function favResto(idRestaurant) {
  let id = idRestaurant.toString();
  setTimeout(() => {
    var favCheck = document.getElementById(`favcheckbox-${id}`);
    favCheck.addEventListener("change", function() {
      if (this.checked) {
        DBHelper.favRestaurant(id);
      } else {
        DBHelper.unfavRestaurant(id);
      }
    });
  }, 300);
}
