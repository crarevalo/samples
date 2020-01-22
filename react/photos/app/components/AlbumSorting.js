import React from "react";
import DropDown from "../../../shared/DropDown.js";

const CustomComparator = function(a, b){
  const v1 = (a && a.order_index) ? a.order_index : -1;
  const v2 = (b && b.order_index) ? b.order_index : -1;
  return (v1 === v2) ? 0 : ((v1 > v2) ? 1 : -1);
};

const DateComparator = function(a, b){
  let v1 = 0, v2 = 0;
  if (a){
    if (a.year) v1 += a.year * 10000;
    if (a.month) v1 += a.month * 100;
    if (a.date) v1 += a.date;
  }
  if (b){
    if (b.year) v2 += b.year * 10000;
    if (b.month) v2 += b.month * 100;
    if (b.date) v2 += b.date;
  }
  if (v1 === v2) return TitleComparator.call(this, a, b);
  else return ((v1 > v2) ? 1 : -1);
};

const TitleComparator = function(a, b){
  const v1 = (a && a.title) ? a.title : "";
  const v2 = (b && b.title) ? b.title : "";
  return v1.localeCompare(v2);
};

const CountComparator = function(a, b){
  const v1 = (a && a.count) ? a.count : -1;
  const v2 = (b && b.count) ? b.count : -1;
  if (v1 === v2) return TitleComparator.call(this, a, b);
  else return ((v1 > v2) ? -1 : 1);
};

export const getAlbumComparator = function(value){
  if (value == 0) return DateComparator;
  else if (value == 1) return TitleComparator;
  else if (value == 2) return CountComparator;
  else return DateComparator;//CustomComparator;
};

const ELEMENTS = [
  /*{value : 0, label : "Custom"},*/
  {value : 0, label : "Date"},
  {value : 1, label : "Title"},
  {value : 2, label : "Count"}
];

const AlbumSorting = function({selected, onChange}){
  return (
    <DropDown elements={ELEMENTS} selected={selected} onChange={onChange} />
  );
};

export default AlbumSorting;
