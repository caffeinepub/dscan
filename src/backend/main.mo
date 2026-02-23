import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Principal "mo:core/Principal";

actor {
  include MixinStorage();

  type Document = {
    id : Text;
    owner : Principal;
    title : Text;
    externalBlob : Storage.ExternalBlob;
  };

  let documents = Map.empty<Text, Document>();

  public shared ({ caller }) func addDocument(id : Text, title : Text, blob : Storage.ExternalBlob) : async () {
    if (documents.containsKey(id)) {
      Runtime.trap("Document already exists");
    };
    let document : Document = {
      id;
      owner = caller;
      title;
      externalBlob = blob;
    };
    documents.add(id, document);
  };

  public query ({ caller }) func getDocument(id : Text) : async Document {
    switch (documents.get(id)) {
      case (null) { Runtime.trap("Document not found") };
      case (?document) {
        if (document.owner != caller) {
          Runtime.trap("Access denied");
        };
        document;
      };
    };
  };

  public query ({ caller }) func searchDocuments(searchTerm : Text) : async [Document] {
    documents.values().toArray().filter(
      func(document) {
        document.owner == caller and document.title.contains(#text searchTerm);
      }
    );
  };

  public shared ({ caller }) func deleteDocument(id : Text) : async () {
    switch (documents.get(id)) {
      case (null) { Runtime.trap("Document not found") };
      case (?document) {
        if (document.owner != caller) {
          Runtime.trap("Access denied");
        };
        documents.remove(id);
      };
    };
  };

  public query ({ caller }) func listDocuments() : async [Document] {
    documents.values().toArray().filter(
      func(document) {
        document.owner == caller;
      }
    );
  };
};
