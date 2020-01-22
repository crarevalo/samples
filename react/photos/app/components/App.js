import React, {Component, Fragment} from "react";
import axios from "axios";
import moment from "moment";
import Albums from "./Albums.js";
import Photos from "./Photos.js";
import AlbumForm from "./AlbumForm.js";
import AlbumHeader from "./AlbumHeader.js";
import AlbumDropDown from "./AlbumDropDown.js";
import AlbumSorting, {getAlbumComparator} from "./AlbumSorting.js";
import PhotoDetails from "./PhotoDetails.js";
import DateTimeRange from "../../../shared/DateTimeRange.js";
import TextField from "../../../shared/TextField.js";
import ActionLink from "../../../shared/ActionLink.js";
import Dialog from "../../../shared/Dialog.js";
import HeadedContent from "../../../shared/HeadedContent.js";
import SelectionDetails from "./SelectionDetails.js";

class App extends Component{

  constructor(props){
    super(props);

    this.state = {
      mode : "home", // home | albums | edit (photo)
      dialog : null, // search | photo | add (selected) | new (album) | edit (album)
      scrollY : 0,
      searchFields : {
        startDate : "",
        endDate : ""
      },
      searchInfo : null,
      albumSorting : 0,
      albumFormValues : {
        title : "",
        description : "",
        year : "",
        month : "",
        date : ""
      },
      albums : null,
      selectedAlbum : null,
      photos : null,
      selectedIds : new Set([]),
      addDialogSelectedValue : "",
      displayPhoto : {
        obj : null,
        className : null,
        src : null,
        exif : null
      },
      editPhoto : null,
      error : null
    };
  }

  onFindUngrouped = () => {
    const self = this;
    axios("/blueprint/ungrouped")
      .then(result => self.setState({dialog : "", selectedAlbum : null, searchInfo : result.data.info, photos : result.data.photos, selectedIds : new Set([])}))
      .catch(error => self.setState({error}));
  }

  onStartDateChanged = (value) => {
    this.setState({searchFields : {...this.state.searchFields, startDate : value}});
  }

  onEndDateChanged = (value) => {
    this.setState({searchFields : {...this.state.searchFields, endDate : value}});
  }

  onSearchChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    this.setState({searchFields : {...this.state.searchFields, [name] : value}});
  }

  onSearchOpen = (event) => {
    this.setState({dialog : "search"});
  }

  onSearchClose = (event) => {
    this.setState({dialog : ""});
  }

  onSearchSubmit = (event) => {
    event.preventDefault();
    const {searchFields} = this.state;
    var flag = false;
    for (let property in searchFields){
      if (searchFields[property].trim()){
        flag = true;
        break;
      }
    }

    if (!flag){
      alert("Please use at least one field.");
      return;
    }

    const {startDate, endDate} = searchFields;
    const self = this;
    axios(`/blueprint/search?date_start=${startDate}&date_end=${endDate}`)
      .then(result => self.setState({dialog : "", selectedAlbum : null, searchInfo : result.data.info, photos : result.data.photos, selectedIds : new Set([])}))
      .catch(error => self.setState({error}));
  }

  onAlbumsMode = () => {
    const self = this;
    const {albumSorting} = this.state;
    axios(`/blueprint/albums`).then(function(result){
      const albums = result.data.albums;
      const comparator = getAlbumComparator(albumSorting);
      albums.sort(comparator);
      self.setState({mode : "albums", dialog : "", albums});
    }).catch(function(error){
      self.setState({error});
    });
  }  

  onAlbumSortingChange = (event) => {
    const albumSorting = event.target.value;
    const {albums} = this.state;
    const comparator = getAlbumComparator(albumSorting);
    albums.sort(comparator);
    this.setState({albumSorting, albums});
  }

  onSetCustomOrder = () => {
    const self = this;
    const {albums} = this.state;
    const order = [];
    for (const album of albums){
      order.push(album.id);
    }
    axios.put("/blueprint/albums", {order}).then(function(result){
      alert(result.data.message);
      //const albums = result.data.albums;
      //self.setState({albums});
      self.onAlbumsMode();
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  onAlbumFormChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    if ((name === "month") || (name === "date") || (name === "year")){
      const regex = /^(\d*)$/;
      if (!regex.test(value)) return;
    }
    this.setState({albumFormValues : {...this.state.albumFormValues, [name] : value}});
  }

  onAlbumCreateOpen = () => {
    this.setState({dialog : "new"});
  }

  onAlbumCreateSubmit = () => {
    const self = this;
    const {albumFormValues, albums} = this.state;
    axios.post("/blueprint/albums", albumFormValues).then(function(result){
      alert(result.data.message);
      const albumFormValues = {title : "", description : "", year : "", month : "", date : ""};
      self.setState({albumFormValues});
      self.onAlbumsMode();
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  onAlbumEditOpen = () => {
    const {title, description, year, month, date} = this.state.selectedAlbum;
    const albumFormValues = {title, description, year, month, date};
    this.setState({dialog : "edit", albumFormValues});
  }

  onAlbumEditSubmit = () => {
    const self = this;
    const {selectedAlbum, albumFormValues} = this.state;
    axios.put(`/blueprint/album/${selectedAlbum.id}`, albumFormValues).then(function(result){
      alert(result.data.message);
      const albumFormValues = {title : "", description : "", year : "", month : "", date : ""};
      self.setState({dialog : "", selectedAlbum : result.data.album, albumFormValues});
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  onClickAlbum = (albumId) => {
    const self = this;
    axios(`/blueprint/album/${albumId}`).then(function(result){
      self.setState({mode : "home", searchInfo : null, selectedAlbum : result.data.album, photos : result.data.photos, selectedIds : new Set([])});
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  onClickThumb = (event, photo) => {
    if (event.ctrlKey){
      const {selectedIds} = this.state;
      if (selectedIds.has(photo.id)) selectedIds.delete(photo.id);
      else selectedIds.add(photo.id);
      this.setState({selectedIds});
    }
    else if (event.shiftKey){
      const {selectedIds, photos} = this.state;
      if (selectedIds && (selectedIds.size === 1)){
        let flag = false;
        for (const currentPhoto of photos){
          if (selectedIds.has(currentPhoto.id)){
            flag = true;
            continue;
          }
          if (flag){
            selectedIds.add(currentPhoto.id);
          }
          if (currentPhoto.id === photo.id) break;
        }
      }
      else{
        alert("Selecting multiple items only works when exactly one item is already selected as the first selection.");
      }
      this.setState({selectedIds});
    }
    else{
      const self = this;
      const {id, display_path, orientation} = photo;
      axios(`/blueprint/photo?path=${display_path}&rotation=${orientation}`)
        .then(result => self.setState({selectedIds : new Set([]), dialog : "photo", displayPhoto : {obj : photo, className : result.data.className, src : result.data.src, exif : result.data.exif}}))
        .catch(error => self.setState({error}));
    }
  }

  onSelectAll = () => {
    const {photos} = this.state;
    if (!photos || !photos.length) return;
    const selectedIds = new Set([]);
    for (const photo of photos){
      selectedIds.add(photo.id);
    }
    this.setState({selectedIds});
  }

  onClearSelection = () => {
    this.setState({selectedIds : new Set([])});
  }

  onAddToAlbum = () => {
    const self = this;
    axios(`/blueprint/albums`)
      .then(result => {
        const {albumSorting} = self.state;
        const albums = result.data.albums;
        const comparator = getAlbumComparator(albumSorting);
        albums.sort(comparator);
        self.setState({albums, mode : "home", dialog : "add"});
      })
      .catch(error => self.setState({error}));
  }

  onAddDialogChange = (event) => {
    this.setState({addDialogSelectedValue : event.target.value});
  }

  onAddDialogSubmit = () => {
    const self = this;
    const {addDialogSelectedValue, selectedIds} = this.state;
    axios.post("/blueprint/photos", {albumId : addDialogSelectedValue, selectedIds : Array.from(selectedIds)}).then(function(result){
      alert(result.data.message);
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  onAddDialogCancel = () => {
    this.setState({dialog : ""});
  }

  onRemoveFromAlbum = () => {
    const self = this;
    const confirmed = confirm("Remove the selected photos from the album?");
    if (confirmed){
      const {selectedAlbum, selectedIds} = this.state;
      axios.delete("/blueprint/photos", {data : {albumId : selectedAlbum.id, selectedIds : Array.from(selectedIds)}}).then(function(result){
        alert(result.data.message);
        self.onClickAlbum(selectedAlbum.id);
      }).catch(function(error){
        alert(error);
        self.setState({error});
      });
    }
  }

  onPhotoClose = () => {
    this.setState({dialog : "", displayPhoto : {obj : null, className : null, src : null, exif : null}});
  }

  onPhotoEdit = () => {
    const scrollY = window.scrollY;
    this.setState({mode : "edit", dialog : "", scrollY});
  }

  onPhotoEditClose = () => {
    this.setState({mode : "home", dialog : "", displayPhoto : {obj : null, className : null, src : null, exif : null}});
  }

  onPhotoEditDownload = () => {
    const self = this;
    const {displayPhoto} = this.state;
    axios({url : `/blueprint/download/${displayPhoto.obj.id}`, method : "GET", responseType : "blob"}).then(function(response){
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", displayPhoto.obj.path);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  onPhotoEditRotate = () => {
    const self = this;
    const {id} = this.state.displayPhoto.obj;
    const {photos} = this.state;
    axios.put("/blueprint/rotate", {photoId : id}).then(function(result){
      const obj = result.data.photo;
      const className = result.data.className;
      self.setState({displayPhoto : {...self.state.displayPhoto, obj, className}});
      for (let i = 0; i < photos.length; i++){
        if (photos[i].id === id){
          photos[i] = obj;
          break;
        }
      }
    }).catch(function(error){
      alert(error);
      self.setState({error});
    });
  }

  componentDidMount(){

  }

  componentDidUpdate(){
    const {mode, dialog, scrollY} = this.state;
    if (dialog !== ""){
      document.body.style.overflow = "hidden";
    }
    else if (dialog === ""){
      document.body.style.overflow = "";
    }

    if ((mode === "home") && (scrollY != 0)){
      window.scrollTo({top : scrollY});
      this.setState({scrollY : 0});
    }
  }

  render(){
    const {mode, dialog, albums, selectedAlbum, albumSorting, photos, selectedIds, searchFields, searchInfo, albumFormValues, addDialogSelectedValue, displayPhoto, editPhoto} = this.state;
    switch (mode){
      case "albums":
        return (
          <Fragment>
            <div>
              <ActionLink onClick={this.onAlbumCreateOpen} className="link">Create New Album</ActionLink>
              <AlbumSorting selected={albumSorting} onChange={this.onAlbumSortingChange} />
              <ActionLink onClick={this.onSetCustomOrder} className={((albumSorting != "0") && false) ? "link" : "hidden"}>Set As Custom Order</ActionLink>
            </div>
            <div>
              <Albums onClick={this.onClickAlbum} className="album-list" albums={albums} />
            </div>
            <Dialog isOpen={dialog === "new"} dialogClassName="react-dialog">
              <ActionLink onClick={this.onSearchClose} className="link dialog-close">Close</ActionLink>
              <AlbumForm className="album-form" onChange={this.onAlbumFormChange} values={albumFormValues} />
              <div className="section">
                <ActionLink onClick={this.onAlbumCreateSubmit} className="link">Submit</ActionLink>
              </div>
            </Dialog>
          </Fragment>
        );
      case "edit":
        return (
          <Fragment>
            <div className="photo-edit-left">
              <div>
                <ActionLink onClick={this.onPhotoEditClose} className="link">Close</ActionLink>
                <ActionLink onClick={this.onPhotoEditDownload} className="link">Download</ActionLink>
                <ActionLink onClick={this.onPhotoEditRotate} className="link">Rotate</ActionLink>
              </div>
              <div>
                <PhotoDetails className="details" photo={displayPhoto.obj} exif={displayPhoto.exif} />
              </div>
            </div>
            <div className="photo-edit-right">
              <img onClick={this.onPhotoEdit} className={displayPhoto.className} src={displayPhoto.src} />
            </div>
          </Fragment>
        );
      default:
        return (
          <Fragment>
            <div className="photos-links">
              <ActionLink onClick={this.onSearchOpen} className="link">Search</ActionLink>
              <ActionLink onClick={this.onAlbumsMode} className="link">Albums</ActionLink>
              <ActionLink onClick={this.onSelectAll} className={(photos && photos.length) ? "link" : "hidden"}>Select All</ActionLink>
              <SelectionDetails count={selectedIds ? selectedIds.size : 0} />
              <ActionLink onClick={this.onClearSelection} className={(selectedIds && (selectedIds.size > 0)) ? "link" : "hidden"}>Clear Selection</ActionLink>
              <ActionLink onClick={this.onAddToAlbum} className={(selectedIds && (selectedIds.size > 0)) ? "link" : "hidden"}>Add To Album</ActionLink>
              <ActionLink onClick={this.onRemoveFromAlbum} className={(selectedAlbum && selectedIds && (selectedIds.size > 0)) ? "link" : "hidden"}>Remove From Album</ActionLink>
            </div>
            <div className="photos-main">
              <HeadedContent headerClassName="searchInfoHeader" contentClassName="searchInfoContent" items={searchInfo} />
              <AlbumHeader className="album-info" album={selectedAlbum} isShowingEdit={true} onClickEdit={this.onAlbumEditOpen} />
              <Photos className="photos-view" photos={photos} selectedIds={selectedIds} onClick={this.onClickThumb} />
              <Dialog isOpen={dialog === "search"} dialogClassName="react-dialog dialog-search">
                <div className="InputFromTo">
                  <DateTimeRange
                    onStartDateChanged={this.onStartDateChanged}
                    onEndDateChanged={this.onEndDateChanged}
                    startDate={searchFields["startDate"]}
                    endDate={searchFields["endDate"]}
                  />
                </div>
                <div>
                  <ActionLink onClick={this.onSearchSubmit} className="link">Search</ActionLink>
                  <ActionLink onClick={this.onFindUngrouped} className="link">Ungrouped</ActionLink>
                  <ActionLink onClick={this.onSearchClose} className="link">Close</ActionLink>
                </div>
              </Dialog>
              <Dialog isOpen={dialog === "add"} dialogClassName="react-dialog dialog-add">
                <AlbumDropDown albums={albums} selected={addDialogSelectedValue} onChange={this.onAddDialogChange} />
                <ActionLink onClick={this.onAddDialogSubmit} className="link">OK</ActionLink>
                <ActionLink onClick={this.onAddDialogCancel} className="link">Cancel</ActionLink>
              </Dialog>
              <Dialog isOpen={dialog === "edit"} dialogClassName="react-dialog">
                <ActionLink onClick={this.onSearchClose} className="link dialog-close">Close</ActionLink>
                <AlbumForm className="album-form" onChange={this.onAlbumFormChange} values={albumFormValues} />
                <div className="section">
                  <ActionLink onClick={this.onAlbumEditSubmit} className="link">Submit</ActionLink>
                </div>
              </Dialog>
              <Dialog isOpen={dialog === "photo"} dialogClassName="photo-dialog" onClickOverlay={this.onPhotoClose}>
                <div>
                  <img onClick={this.onPhotoEdit} className={displayPhoto.className} src={displayPhoto.src} />
                </div>
              </Dialog>
            </div>
          </Fragment>
        );
    };
  }
}

export default App;
