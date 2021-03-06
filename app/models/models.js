var connection = require("../../config/sequelize.js");

var UserMeta = require("./user.server.model.js");
var AccessMeta = require("./access.server.model.js");
var LocationMeta = require("./location.server.model.js");
var NoteMeta = require("./note.server.model.js");
var TextMeta = require("./text.server.model.js");
var PhotoMeta = require("./photo.server.model.js");
var PhotoKeywordMeta = require("./photokeyword.server.model.js");
var PhotoSubjectMeta = require("./photosubject.server.model.js");
var PhotoAlbumHeaderMeta = require("./photoalbumheader.server.model.js");
var PhotoAlbumMeta = require("./photoalbum.server.model.js");
var EmailMeta = require("./email.server.model.js");
var EmailRecipientMeta = require("./emailrecipient.server.model.js");
var EmailKeywordMeta = require("./emailkeyword.server.model.js");
var EmailRelevanceMeta = require("./emailrelevance.server.model.js");
var LogMeta = require("./log.server.model.js");
var LogTypeMeta = require("./logtype.server.model.js");
var LogRelevanceMeta = require("./logrelevance.server.model.js");
var LogKeywordMeta = require("./logkeyword.server.model.js");
var LogLocationMeta = require("./loglocation.server.model.js");
var LocationDefinitionMeta = require("./locationdefinition.server.model.js");
var ChecklistMeta = require("./checklist.server.model.js");
var TaskMeta = require("./task.server.model.js");
var ChecklistTaskMeta = require("./checklisttask.server.model.js");
var TaskEventDefinitionMeta = require("./taskeventdefinition.server.model.js");
var TaskEventMeta = require("./taskevent.server.model.js");
var ActionMeta = require("./action.server.model.js");
var AlarmMeta = require("./alarm.server.model.js");
var ChangeLogMeta = require("./changelog.server.model.js");
var FileMeta = require("./file.server.model.js");
var FileTypeMeta = require("./filetype.server.model.js");
var KeywordsMeta = require("./keywords.server.model.js");
var NominalMeta = require("./nominal.server.model.js");
var NumbersMeta = require("./numbers.server.model.js");
var ProfileMeta = require("./profiles.server.model.js");
var ProjectMeta = require("./project.server.model.js");
var ProjectGroupMeta = require("./projectgroup.server.model.js");
var ProjectGroupHeaderMeta = require("./projectgroupheader.server.model.js");
var SectionMeta = require("./section.server.model.js");
var SectionHeaderMeta = require("./sectionheader.server.model.js");
var SectionTypeMeta = require("./sectiontype.server.model.js");
var StatusMeta = require("./status.server.model.js");
var TasksMeta = require("./tasks.server.model.js");
var SessionHeaderMeta = require("./sessionheader.server.model.js");
var SessionMeta = require("./session.server.model.js");
var ScanMeta = require("./scan.server.model.js");
var ScanSubjectMeta = require("./scansubject.server.model.js");
var ScanGroupingDefinitionMeta = require("./scangroupingdefinition.server.model.js");
var ScanGroupingMeta = require("./scangrouping.server.model.js");
var ScanLinkTypeMeta = require("./scanlinktype.server.model.js");
var ScanLinkMeta = require("./scanlink.server.model.js");
var ScanKeywordMeta = require("./scankeyword.server.model.js");
var VideoMeta = require("./video.server.model.js");
var VideoLocationMeta = require("./videolocation.server.model.js");
var VideoAuthorMeta = require("./videoauthor.server.model.js");
var VideoKeywordMeta = require("./videokeyword.server.model.js");
var TreeProfileMeta = require("./treeprofile.server.model.js");
var TreeUnionMeta = require("./treeunion.server.model.js");
var TreeChildMeta = require("./treechild.server.model.js");
var AlbumMeta = require("./album.server.model.js");
var ArtistMeta = require("./artist.server.model.js");
var SongMeta = require("./song.server.model.js");
var ReceiptMeta = require("./receipt.server.model.js");
var RecipeMeta = require("./recipe.server.model.js");
var IngredientMeta = require("./ingredient.server.model.js");
var ProcessMeta = require("./process.server.model.js");

var User = connection.sentience.define("user", UserMeta.attributes, UserMeta.options);
var Access = connection.sentience.define("access", AccessMeta.attributes, AccessMeta.options);
var Location = connection.happenstance.define("location", LocationMeta.attributes, LocationMeta.options);
var Note = connection.happenstance.define("note", NoteMeta.attributes, NoteMeta.options);
var Text = connection.happenstance.define("sms", TextMeta.attributes, TextMeta.options);
var Photo = connection.blueprint.define("photo", PhotoMeta.attributes, PhotoMeta.options);
var PhotoKeyword = connection.blueprint.define("photokeyword", PhotoKeywordMeta.attributes, PhotoKeywordMeta.options);
var PhotoSubject = connection.blueprint.define("photosubject", PhotoSubjectMeta.attributes, PhotoSubjectMeta.options);
var PhotoAlbumHeader = connection.blueprint.define("photoalbumheader", PhotoAlbumHeaderMeta.attributes, PhotoAlbumHeaderMeta.options);
var PhotoAlbum = connection.blueprint.define("photoalbum", PhotoAlbumMeta.attributes, PhotoAlbumMeta.options);
var Email = connection.happenstance.define("email", EmailMeta.attributes, EmailMeta.options);
var EmailRecipient = connection.happenstance.define("email_recipient", EmailRecipientMeta.attributes, EmailRecipientMeta.options);
var EmailKeyword = connection.happenstance.define("email_keyword", EmailKeywordMeta.attributes, EmailKeywordMeta.options);
var EmailRelevance = connection.happenstance.define("email_relevance", EmailRelevanceMeta.attributes, EmailRelevanceMeta.options);
var Log = connection.happenstance.define("log", LogMeta.attributes, LogMeta.options);
var LogType = connection.happenstance.define("log_type", LogTypeMeta.attributes, LogTypeMeta.options);
var LogRelevance = connection.happenstance.define("log_relevance", LogRelevanceMeta.attributes, LogRelevanceMeta.options);
var LogKeyword = connection.happenstance.define("log_keyword", LogKeywordMeta.attributes, LogKeywordMeta.options);
var LogLocation = connection.happenstance.define("log_location", LogLocationMeta.attributes, LogLocationMeta.options);
var LocationDefinition = connection.happenstance.define("location_definition", LocationDefinitionMeta.attributes, LocationDefinitionMeta.options);
var Checklist = connection.sentience.define("checklist", ChecklistMeta.attributes, ChecklistMeta.options);
var Task = connection.sentience.define("task", TaskMeta.attributes, TaskMeta.options);
var ChecklistTask = connection.sentience.define("checklist_task", ChecklistTaskMeta.attributes, ChecklistTaskMeta.options);
var TaskEventDefinition = connection.sentience.define("task_event_definition", TaskEventDefinitionMeta.attribute, TaskEventDefinitionMeta.options);
var TaskEvent = connection.sentience.define("task_event", TaskEventMeta.attributes, TaskEventMeta.options);
var Action = connection.sentience.define("action", ActionMeta.attributes, ActionMeta.options);
var Alarm = connection.sentience.define("alarm", AlarmMeta.attributes, AlarmMeta.options);
var ChangeLog = connection.sentience.define("change_log", ChangeLogMeta.attributes, ChangeLogMeta.options);
var File = connection.sentience.define("file", FileMeta.attributes, FileMeta.options);
var FileType = connection.sentience.define("file_type", FileTypeMeta.attributes, FileTypeMeta.options);
var Keywords = connection.sentience.define("keyword", KeywordsMeta.attributes, KeywordsMeta.options);
var Nominal = connection.sentience.define("nominal", NominalMeta.attributes, NominalMeta.options);
var Numbers = connection.sentience.define("number", NumbersMeta.attributes, NumbersMeta.options);
var Profile = connection.sentience.define("profile", ProfileMeta.attributes, ProfileMeta.options);
var Project = connection.sentience.define("project", ProjectMeta.attributes, ProjectMeta.options);
var ProjectGroup = connection.sentience.define("project_group", ProjectGroupMeta.attributes, ProjectGroupMeta.options);
var ProjectGroupHeader = connection.sentience.define("project_group_header", ProjectGroupHeaderMeta.attributes, ProjectGroupHeaderMeta.options);
var Section = connection.sentience.define("section", SectionMeta.attributes, SectionMeta.options);
var SectionHeader = connection.sentience.define("section_header", SectionHeaderMeta.attributes, SectionHeaderMeta.options);
var SectionType= connection.sentience.define("section_type", SectionTypeMeta.attributes, SectionTypeMeta.options);
var Status = connection.sentience.define("status", StatusMeta.attributes, StatusMeta.options);
var Tasks = connection.sentience.define("section_checklist", TasksMeta.attributes, TasksMeta.options);
var SessionHeader = connection.sentience.define("session_header", SessionHeaderMeta.attributes, SessionHeaderMeta.options);
var Session = connection.sentience.define("session", SessionMeta.attributes, SessionMeta.options);
var Scan = connection.mimeo.define("scan", ScanMeta.attributes, ScanMeta.options);
var ScanSubject = connection.mimeo.define("subject", ScanSubjectMeta.attributes, ScanSubjectMeta.options);
var ScanGroupingDefinition = connection.mimeo.define("grouping_definition", ScanGroupingDefinitionMeta.attributes, ScanGroupingDefinitionMeta.options);
var ScanGrouping = connection.mimeo.define("grouping", ScanGroupingMeta.attributes, ScanGroupingMeta.options);
var ScanLinkType = connection.mimeo.define("link_type", ScanLinkTypeMeta.attributes, ScanLinkTypeMeta.options);
var ScanLink = connection.mimeo.define("link", ScanLinkMeta.attributes, ScanLinkMeta.options);
var ScanKeyword = connection.mimeo.define("keyword", ScanKeywordMeta.attributes, ScanKeywordMeta.options);
var Video = connection.oritani.define("video", VideoMeta.attributes, VideoMeta.options);
var VideoLocation = connection.oritani.define("location", VideoLocationMeta.attributes, VideoLocationMeta.options);
var VideoAuthor = connection.oritani.define("author", VideoAuthorMeta.attributes, VideoAuthorMeta.options);
var VideoKeyword = connection.oritani.define("keyword", VideoKeywordMeta.attributes, VideoKeywordMeta.options);
var TreeProfile = connection.deltaic.define("profile", TreeProfileMeta.attributes, TreeProfileMeta.options);
var TreeUnion = connection.deltaic.define("partnership", TreeUnionMeta.attributes, TreeUnionMeta.options);
var TreeChild = connection.deltaic.define("child", TreeChildMeta.attributes, TreeChildMeta.options);
var Album = connection.aether.define("album", AlbumMeta.attributes, AlbumMeta.options);
var Artist = connection.aether.define("artist", ArtistMeta.attributes, ArtistMeta.options);
var Song = connection.aether.define("song", SongMeta.attributes, SongMeta.options);
var Receipt = connection.grandeur.define("receipt", ReceiptMeta.attributes, ReceiptMeta.options);
var Recipe = connection.sorcerer.define("recipe", RecipeMeta.attributes, RecipeMeta.options);
var Ingredient = connection.sorcerer.define("ingredient", IngredientMeta.attributes, IngredientMeta.options);
var Process = connection.sorcerer.define("process", ProcessMeta.attributes, ProcessMeta.options);

Numbers.belongsTo(Profile, {foreignKey: "profile_id", constraints: false});

Email.belongsTo(EmailKeyword, {foreignKey: "id", constraints: false});
EmailKeyword.belongsTo(Email, {foreignKey: "email_id", constraints: false});
Log.belongsTo(LogKeyword, {foreignKey: "id", constraints: false});
LogKeyword.belongsTo(Log, {foreignKey: "log_id", constraints: false});

ProjectGroupHeader.hasMany(ProjectGroup, {foreignKey: "project_group_id", constraints: false});
Project.belongsTo(Status, {foreignKey: "status_id", constraints: false});
SectionHeader.belongsTo(SectionType, {foreignKey: "type_id", constraints: false});
Section.belongsTo(File, {foreignKey: "file_id", constraints: false});
ChangeLog.belongsTo(User, {foreignKey: "user_id", constraints: false});
ChangeLog.belongsTo(File, {foreignKey: "file_id", constraints: false});
ChangeLog.belongsTo(Action, {foreignKey: "action_id", constraints: false});
Section.belongsTo(SectionHeader, {foreignKey: "section_id", constraints: false});
File.belongsTo(Status, {foreignKey: "status_id", constraints: false});
File.belongsTo(FileType, {foreignKey: "type_id", constraints: false});
Session.belongsTo(SessionHeader, {foreignKey: "session_id", constraints: false});

ScanGroupingDefinition.belongsTo(Scan, {foreignKey: "cover_id", constraints: false});
ScanGrouping.belongsTo(Scan, {foreignKey: "scan_id", constraints: false});
Song.belongsTo(Artist, {foreignKey: "artist_id", constraints: false});
Song.belongsTo(Album, {foreignKey: "album_id", constraints: false});

User.sync();
Access.sync();
Location.sync();
Note.sync();
Text.sync();
Photo.sync();
PhotoKeyword.sync();
PhotoSubject.sync();
PhotoAlbumHeader.sync();
PhotoAlbum.sync();
Email.sync();
EmailRecipient.sync();
EmailKeyword.sync();
EmailRelevance.sync();
Log.sync();
LogType.sync();
LogRelevance.sync();
LogKeyword.sync();
LogLocation.sync();
LocationDefinition.sync();
Checklist.sync();
Task.sync();
ChecklistTask.sync();
TaskEventDefinition.sync();
TaskEvent.sync();
Action.sync();
Alarm.sync();
ChangeLog.sync();
File.sync();
FileType.sync();
Keywords.sync();
Nominal.sync();
Numbers.sync();
Profile.sync();
Project.sync();
ProjectGroup.sync();
ProjectGroupHeader.sync();
Section.sync();
SectionHeader.sync();
SectionType.sync();
Status.sync();
Tasks.sync();
SessionHeader.sync();
Session.sync();
Scan.sync();
ScanSubject.sync();
ScanGroupingDefinition.sync();
ScanGrouping.sync();
ScanLinkType.sync();
ScanLink.sync();
ScanKeyword.sync();
Video.sync();
VideoLocation.sync();
VideoAuthor.sync();
VideoKeyword.sync();
TreeProfile.sync();
TreeUnion.sync();
TreeChild.sync();
Album.sync();
Artist.sync();
Song.sync();
Receipt.sync();
Recipe.sync();
Ingredient.sync();
Process.sync();

connection.sentience.sync();
connection.happenstance.sync();
connection.blueprint.sync();
connection.mimeo.sync();
connection.oritani.sync();
connection.deltaic.sync();
connection.aether.sync();
connection.grandeur.sync();
connection.sorcerer.sync();

module.exports.User = User;
module.exports.Access = Access;
module.exports.Location = Location;
module.exports.Note = Note;
module.exports.Text = Text;
module.exports.Photo = Photo;
module.exports.PhotoKeyword = PhotoKeyword;
module.exports.PhotoSubject = PhotoSubject;
module.exports.PhotoAlbumHeader = PhotoAlbumHeader;
module.exports.PhotoAlbum = PhotoAlbum;
module.exports.Email = Email;
module.exports.EmailRecipient = EmailRecipient;
module.exports.EmailKeyword = EmailKeyword;
module.exports.EmailRelevance = EmailRelevance;
module.exports.Log = Log;
module.exports.LogType = LogType;
module.exports.LogRelevance = LogRelevance;
module.exports.LogKeyword = LogKeyword;
module.exports.LogLocation = LogLocation;
module.exports.LocationDefinition = LocationDefinition;
module.exports.Checklist = Checklist;
module.exports.Task = Task;
module.exports.ChecklistTask = ChecklistTask;
module.exports.TaskEventDefinition = TaskEventDefinition;
module.exports.TaskEvent = TaskEvent;
module.exports.Action = Action;
module.exports.Alarm = Alarm;
module.exports.ChangeLog = ChangeLog;
module.exports.File = File;
module.exports.FileType = FileType;
module.exports.Keywords = Keywords;
module.exports.Nominal = Nominal;
module.exports.Numbers = Numbers;
module.exports.Profile = Profile;
module.exports.Project = Project;
module.exports.ProjectGroup = ProjectGroup;
module.exports.ProjectGroupHeader = ProjectGroupHeader;
module.exports.Section = Section;
module.exports.SectionHeader = SectionHeader;
module.exports.SectionType = SectionType;
module.exports.Status = Status;
module.exports.Tasks = Tasks;
module.exports.SessionHeader = SessionHeader;
module.exports.Session = Session;
module.exports.Scan = Scan;
module.exports.ScanSubject = ScanSubject;
module.exports.ScanGroupingDefinition = ScanGroupingDefinition;
module.exports.ScanGrouping = ScanGrouping;
module.exports.ScanLinkType = ScanLinkType;
module.exports.ScanLink = ScanLink;
module.exports.ScanKeyword = ScanKeyword;
module.exports.Video = Video;
module.exports.VideoLocation = VideoLocation;
module.exports.VideoAuthor = VideoAuthor;
module.exports.VideoKeyword = VideoKeyword;
module.exports.TreeProfile = TreeProfile;
module.exports.TreeUnion = TreeUnion;
module.exports.TreeChild = TreeChild;
module.exports.Album = Album;
module.exports.Artist = Artist;
module.exports.Song = Song;
module.exports.Receipt = Receipt;
module.exports.Recipe = Recipe;
module.exports.Ingredient = Ingredient;
module.exports.Process = Process;
