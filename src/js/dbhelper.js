"use strict";

/**
 * Common server api & database helper functions.
 */
class DBHelper {
  /**
   * Server URL.
   */
  static get BASE_URL() {
    const port = 1337; // Change this to your local server port
    return `http://localhost:${port}/`;
  }

  /**
   * Restaurants endpoint URL.
   */
  static get RESTAURANTS_URL() {
    return `${this.BASE_URL}restaurants/`;
  }

  static get REVIEWS_URL() {
    return `${this.BASE_URL}reviews/`;
  }

  /**
   * Restaurants endpoint URL.
   */
  static get RESTAURANTS_URL() {
    return `${this.BASE_URL}restaurants/`;
  }

  /**
   * Fetch all restaurants from the server
   */
  static fetchRestaurants() {
    return new Promise((resolve, reject) => {
      // fetch from server
      this._fetchObject(this.RESTAURANTS_URL)
        .then(restaurants => {
          resolve(restaurants);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch a restaurant by id from the server
   */
  static fetchRestaurantById(restaurant_id) {
    return new Promise((resolve, reject) => {
      // fetch from server
      this._fetchObject(this.RESTAURANTS_URL, restaurant_id)
        .then(restaurant => {
          resolve(restaurant);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch reviews by id from the server
   */
  static fetchReviewsById(restaurant_id) {
    return new Promise((resolve, reject) => {
      // fetch from server
      console.log(`${this.REVIEWS_URL}?restaurant_id=${restaurant_id}`);
      this._fetchObject(`${this.REVIEWS_URL}?restaurant_id=${restaurant_id}`)
        .then(reviews => {
          resolve(reviews);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch all neighborhoods from the server.
   */
  static fetchNeighborhoods() {
    return new Promise((resolve, reject) => {
      this.fetchRestaurants()
        .then(restaurants => {
          const neighborhoods = restaurants.map(
            (v, i) => restaurants[i].neighborhood
          );
          const uniqueNeighborhoods = neighborhoods.filter(
            (v, i) => neighborhoods.indexOf(v) == i
          );
          resolve(uniqueNeighborhoods);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch all cuisines from the server.
   */
  static fetchCuisines() {
    return new Promise((resolve, reject) => {
      this.fetchRestaurants()
        .then(restaurants => {
          const cuisines = restaurants.map(
            (v, i) => restaurants[i].cuisine_type
          );
          const uniqueCuisines = cuisines.filter(
            (v, i) => cuisines.indexOf(v) == i
          );
          resolve(uniqueCuisines);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch restaurants by a cuisine from the server.
   */
  static fetchRestaurantByCuisine(cuisine) {
    return new Promise((resolve, reject) => {
      this.fetchRestaurants()
        .then(restaurants => {
          const results = restaurants.filter(r => r.cuisine_type == cuisine);
          resolve(results);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch restaurants by a neighborhood from the server.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    return new Promise((resolve, reject) => {
      this.fetchRestaurants()
        .then(restaurants => {
          const results = restaurants.filter(
            r => r.neighborhood == neighborhood
          );
          resolve(results);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood from server.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    return new Promise((resolve, reject) => {
      this.fetchRestaurants()
        .then(restaurants => {
          let results = restaurants;
          if (cuisine != "all") {
            // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != "all") {
            // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          resolve(results);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Generic private helper function to fetch a json object from server.
   */
  static _fetchObject(url, id = null) {
    return new Promise((resolve, reject) => {
      let completeUrl = url;
      if (id) {
        completeUrl += id;
      }
      var headers = new Headers();
      headers.append("Content-Type", "application/json");

      var init = {
        method: "GET",
        headers: headers
      };

      fetch(completeUrl, init)
        .then(response => {
          return response.json();
        })
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Page URL for a restaurant.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(
    restaurant,
    map,
    animation = google.maps.Animation.DROP
  ) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: animation
    });
    return marker;
  }

  /**
   * Image scr for a restaurant.
   * Incase there is no photo, return a placeholder.
   */
  static imgSrcForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return `./img/${restaurant.photograph}.jpg`;
    } else {
      return "./img/restaurant-placeholder.jpg";
    }
  }

  static favRestaurant(id) {
    axios
      .post(`${this.RESTAURANTS_URL}${id}/?is_favorite=true`)
      .then(function(response) {
        console.log(`restaurant with id ${id} faved`, response);
      })
      .catch(function(error) {
        console.log("error during post", error);
      });
  }

  static postReview(id, name, rating, comments) {
    let reviewCreated = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comments
    };
    axios
      .post(this.REVIEWS_URL, reviewCreated)
      .then(function(response) {
        // remove thsi later
        DBHelper.addReviewToDb(reviewCreated);
        console.log(`${name} your review was successfully posted`, response);
      })
      .catch(function(error) {
        if (error) {
          DBHelper.addReviewToDb(reviewCreated);
          console.log("review added to database. Will be posted when online");
        }
        console.log(error);
      });
  }

  static unfavRestaurant(id) {
    axios
      .post(`${this.RESTAURANTS_URL}${id}/?is_favorite=false`)
      .then(function(response) {
        console.log(`restaurant with id ${id} unfaved`, response);
      })
      .catch(function(error) {
        console.log("error during post", error);
      });
  }

  /**
   * Thumbnail image scr for a restaurant.
   * Incase there is no photo, return a placeholder.
   */
  static thumbSrcForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return `./img/${restaurant.photograph}-thumb.jpg`;
    } else {
      return "./img/restaurant-placeholder-thumb.jpg";
    }
  }

  static get DB_NAME() {
    return "restaurants-db";
  }

  static get DB_VERSION() {
    return 1;
  }

  static get DB_RESTAURANT_STORE_NAME() {
    return "restaurants";
  }

  static get DB_REVIEW_STORE_NAME() {
    return "reviews";
  }

  /**
   * Database promise
   */
  static get dbPromise() {
    return idb.open(this.DB_NAME, this.DB_VERSION, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore(this.DB_RESTAURANT_STORE_NAME);
        case 1:
          upgradeDb.createObjectStore(this.DB_REVIEW_STORE_NAME, {
            keyPath: "name"
          });
      }
    });
  }

  /**
   * Add restaurant to IndexDB
   */
  static addRestaurantToDb(restaurant) {
    this.dbPromise.then(db => {
      const tx = db.transaction(this.DB_RESTAURANT_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.DB_RESTAURANT_STORE_NAME);
      store.put(restaurant, restaurant.id);
      return tx.complete;
    });
  }

  /**
   * Add pending review to IndexDB
   */
  static addReviewToDb(review) {
    this.dbPromise.then(db => {
      const tx = db.transaction(this.DB_REVIEW_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.DB_REVIEW_STORE_NAME);
      store.put(review, review.name);
      return tx.complete;
    });
  }

  /**
   * Remove review from IndexDB
   */
  static removeReviewFromDb(review) {
    this.dbPromise.then(db => {
      const tx = db.transaction(this.DB_REVIEW_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.DB_REVIEW_STORE_NAME);
      console.log(store);

      store.delete(review.name);
      return tx.complete;
    });
  }

  /**
   * Get all reviews from IndexDB
   */
  static getReviewsFromDb() {
    return new Promise((resolve, reject) => {
      this.dbPromise
        .then(db => {
          const tx = db.transaction(this.DB_REVIEW_STORE_NAME);
          const store = tx.objectStore(this.DB_REVIEW_STORE_NAME);
          console.log(store.getAll());
          return store.getAll();
        })
        .then(reviews => {
          resolve(reviews);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Add an array of restaurants to IndexDB
   */
  static addRestaurantsToDb(restaurants) {
    this.dbPromise.then(db => {
      const tx = db.transaction(this.DB_RESTAURANT_STORE_NAME, "readwrite");
      const store = tx.objectStore(this.DB_RESTAURANT_STORE_NAME);
      restaurants.map(restaurant => store.put(restaurant, restaurant.id));
      return tx.complete;
    });
  }

  /**
   * Get all restaurants from IndexDB
   */
  static getRestaurantsFromDb() {
    return new Promise((resolve, reject) => {
      this.dbPromise
        .then(db => {
          const tx = db.transaction(this.DB_RESTAURANT_STORE_NAME);
          const store = tx.objectStore(this.DB_RESTAURANT_STORE_NAME);
          return store.getAll();
        })
        .then(restaurants => {
          resolve(restaurants);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get a restaurant from IndexDB
   */
  static getRestaurantFromDb(restaurant_id) {
    return new Promise((resolve, reject) => {
      this.dbPromise
        .then(db => {
          const tx = db.transaction(this.DB_RESTAURANT_STORE_NAME);
          const store = tx.objectStore(this.DB_RESTAURANT_STORE_NAME);
          return store.get(restaurant_id);
        })
        .then(restaurant => {
          resolve(restaurant);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Register service worker for an offline first experience
   */
  static registerServiceWorker() {
    if (!navigator.serviceWorker) {
      // service worker is not supported by browser
      return;
    }
    navigator.serviceWorker
      .register("/sw.min.js")
      .then(() => {
        console.log("Service worker registered!");
      })
      .catch(error => {
        console.error(`Service worker registration failed, ${error}`);
      });
  }
}

DBHelper.registerServiceWorker();
