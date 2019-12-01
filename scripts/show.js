// Open the 'new review' form
var showNewReview = function () {
    document.getElementById("newReview").style.display = "block";  
};

// Close the 'new review' form
var hideNewReview = function () {
    document.getElementById("newReview").style.display = "none";  
};  

// Update stars rating
var selectStar = function (n) {
    document.getElementsByClassName("newReview__rating")[0].value = n;
    var starsReviews = document.getElementsByClassName("starsReview");
    for (let i=0; i<starsReviews.length; i++) {
        starsReviews[i].classList.remove("starReview__selected");
    }
    document.getElementsByClassName("starsReview__"+n)[0].className += " starReview__selected";
};

// Form validation:
// Stars rating is a mandatory field
var validateNewReview = function () {
    alert(document.getElementsByClassName("newReview__rating")[0].value);
    return false;

};