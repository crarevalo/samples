function focusInput(element){
  if (!element) return;
  element.value = "";
  element.style.color = "#000000";
  element.type = "password";
}

function blurInput(element, label){
  if (!element) return;
  if (element.value == ""){
    element.value = label;
    element.style.color = "#999999";
    element.type = "text";
  }
}

