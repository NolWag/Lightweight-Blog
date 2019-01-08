// function encodeImageFileAsURL(element) {
// 
//   var file = element.files[0];
//   var reader = new FileReader();
// 
//   reader.onloadend = function() {
//     console.log('RESULT', reader.result)
//   }
// 
//   reader.readAsDataURL(file);
// }

function viewImage(input) {
    if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imageThumb').attr('src', e.target.result);
            }   
            reader.readAsDataURL(input.files[0]);
    }
}