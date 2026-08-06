// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})();

// Filters & Taxes UI Logic
document.addEventListener("DOMContentLoaded", () => {
  // Tax switch toggle functionality
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  if (taxSwitch) {
    taxSwitch.addEventListener("change", function () {
      const taxInfoList = document.querySelectorAll(".tax-info");
      for (const info of taxInfoList) {
        if (this.checked) {
          info.style.display = "inline";
        } else {
          info.style.display = "none";
        }
      }
    });
  }

  // Category filters functionality
  const filters = document.querySelectorAll(".filter");

  filters.forEach(filter => {
    filter.addEventListener("click", function () {
      const isActive = this.classList.contains("active-filter");

      // Reset all filters first
      filters.forEach(f => f.classList.remove("active-filter"));

      if (!isActive) {
        // Mark clicked filter as active
        this.classList.add("active-filter");
      }
    });
  });
});