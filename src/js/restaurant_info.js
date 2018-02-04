"use strict";

let restaurant;
let map;
let reviews;

function updateOnlineStatus() {
  console.log("User is online");
  if (navigator.onLine) {
    DBHelper.getReviewsFromDb().then(reviews => {
      if (reviews) {
        // Take the unposted reviews
        reviews.forEach(review => {
          // Post to server
          DBHelper.postReview(
            review.restaurant_id,
            review.name,
            review.rating,
            review.comments
          );
        });

        var resto = self.restaurant;
        console.log(resto.id);

        // Fetch and add reviews to window object
        DBHelper.fetchReviewsById(resto.id)
          .then(reviews => {
            self.reviews = reviews;
            resetReviews(reviews);
            fillReviewsHTML();
          })
          .catch(error => {
            alert(error);
          });
      }
    });
  }
}

function updateOfflineStatus() {
  console.log("User is offline");
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOfflineStatus);

window.onload = function() {};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  // Fetch all restaurants from URL then add to window and map
  fetchRestaurantFromURL()
    .then(restaurant => {
      self.restaurant = restaurant;
      self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillRestaurantHTML();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

      // Fetch and add reviews to window object
      fetchReviewsFromURL()
        .then(reviews => {
          self.reviews = reviews;
          fillReviewsHTML();
        })
        .catch(error => {
          alert(error);
        });
    })
    .catch(error => {
      alert(error);
    });
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = callback => {
  return new Promise((resolve, reject) => {
    if (self.restaurant) {
      // restaurant already fetched!
      resolve(self.restaurant);
      return;
    }
    const id = getParameterByName("id");
    if (!id) {
      reject("No restaurant id in URL");
      return;
    }
    DBHelper.fetchRestaurantById(id)
      .then(restaurant => {
        if (!restaurant) {
          reject("Restaurant not found!");
          return;
        }
        resolve(restaurant);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * Get current restaurant from page URL.
 */
const fetchReviewsFromURL = callback => {
  return new Promise((resolve, reject) => {
    if (self.reviews) {
      // reviews already fetched!
      resolve(self.reviews);
      return;
    }
    DBHelper.fetchReviewsById(self.restaurant.id)
      .then(reviews => {
        if (!reviews) {
          reject("reviews not found!");
          return;
        }
        resolve(reviews);
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.id = `favcheckbox-${restaurant.id}`;

  if (restaurant.is_favorite) console.log("This restaurant is faved");
  else console.log("This restaurant is NOT faved");

  if (restaurant.is_favorite == "true") {
    input.checked = restaurant.is_favorite;
  } else {
    input.removeAttribute("checked");
  }

  input.setAttribute("name", `plain-${restaurant.id}`);
  input.onclick = favResto(restaurant.id);

  const label = document.createElement("label");
  label.setAttribute("for", `plain-${restaurant.id}`);
  label.innerHTML = "Mark Restaurant as Favorite";

  const iconWrapper = document.createElement("div");
  iconWrapper.className = "state p-success-o";

  const icon = document.createElement("i");
  icon.className = "icon mdi mdi-heart";

  iconWrapper.appendChild(icon);
  iconWrapper.appendChild(label);

  const favCheck = document.getElementById("fav-check");
  favCheck.className = "pretty p-icon p-round p-plain p-smooth";
  favCheck.appendChild(input);
  favCheck.appendChild(iconWrapper);

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.src = DBHelper.imgSrcForRestaurant(restaurant);

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  for (let key in operatingHours) {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById("reviews-container");
  const divider = document.createElement("br");

  if (!reviews) {
    const noReviews = document.createElement("p");
    noReviews.innerHTML = "No reviews yet!";
    container.appendChild(noReviews);
    return;
  }

  // To put the earliest reviews at the bottom
  reviews.reverse();

  // Generate the reviews
  const ul = document.getElementById("reviews-list");
  ul.appendChild(divider);
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement("li");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(name);

  // Construct readable date
  let dateObj = new Date(review.createdAt);
  var month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ][dateObj.getMonth()];
  var postDate = dateObj.getDate() + " " + month + " " + dateObj.getFullYear();

  const date = document.createElement("p");
  date.innerHTML = postDate;
  li.appendChild(date);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url = window.location.href) => {
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const reviewRestaurant = (restaurant = self.restaurant) => {
  let id = restaurant.id;
  let name = document.getElementById("post-review-name").value;
  let rating = document.getElementById("post-review-rating").value;
  let message = document.getElementById("post-review-message").value;

  // Control validate Entries
  if (name != "" && message != "") {
    // Post review
    let reviewCreated = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: message
    };

    axios
      .post(DBHelper.REVIEWS_URL, reviewCreated)
      .then(function(response) {
        // remove thsi later
        //DBHelper.addReviewToDb(reviewCreated);
        console.log(`${name} your review was successfully posted`, response);

        // Fetch and add reviews to window object
        DBHelper.fetchReviewsById(restaurant.id)
          .then(reviews => {
            self.reviews = reviews;
            resetReviews(reviews);
            fillReviewsHTML();
          })
          .catch(error => {
            alert(error);
          });
      })
      .catch(function(error) {
        if (error) {
          DBHelper.addReviewToDb(reviewCreated);
          console.log("review added to database. Will be posted when online");
        }
        console.log(error);
      });
  } else console.log("You are trying to post an empty review.");
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetReviews = reviews => {
  // Remove all restaurants
  self.reviews = [];
  const ul = document.getElementById("reviews-list");
  ul.innerHTML = "";

  // Remove all map markers
  self.reviews = reviews;
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
