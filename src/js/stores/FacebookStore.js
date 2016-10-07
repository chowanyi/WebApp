var FluxMapStore = require("flux/lib/FluxMapStore");
import FacebookConstants from "../constants/FacebookConstants";
import FacebookActions from "../actions/FacebookActions";
import Dispatcher from "../dispatcher/Dispatcher";
import VoterActions from "../actions/VoterActions";

class FacebookStore extends FluxMapStore {
  getInitialState (){
    return {
      authData: {},
      emailData: {}
    };
  }

  get facebookAuthData (){
    return this.getState().authData;
  }

  get facebookEmailData (){
    return this.getState().emailData;
  }

  getFacebookState () {
    return {
      accessToken: this.accessToken,
      facebookIsLoggedIn: this.loggedIn,
      userId: this.userId,
      // facebookPictureStatus: this.getState().facebookPictureStatus,
      // facebookPictureUrl: this.getState().facebookPictureUrl,
      facebook_retrieve_attempted: this.getState().facebook_retrieve_attempted,
      facebook_sign_in_verified: this.getState().facebook_sign_in_verified,
      facebook_sign_in_failed: this.getState().facebook_sign_in_failed,
      facebook_secret_key: this.getState().facebook_secret_key,
      voter_we_vote_id_attached_to_facebook: this.getState().voter_we_vote_id_attached_to_facebook,
      voter_we_vote_id_attached_to_facebook_email: this.getState().voter_we_vote_id_attached_to_facebook_email,
      yes_please_merge_accounts: this.getState().yes_please_merge_accounts,
    };
  }

  get loggedIn () {
    if (!this.facebookAuthData) {
        return undefined;
    }

    return this.facebookAuthData.status === "connected";
  }

  get userId () {
    if (!this.facebookAuthData || !this.facebookAuthData.authResponse) {
        return undefined;
    }

    return this.facebookAuthData.authResponse.userID;
  }

  get accessToken () {
    if (!this.facebookAuthData || !this.facebookAuthData.authResponse) {
        return undefined;
    }

    return this.facebookAuthData.authResponse.accessToken;
  }

  reduce (state, action) {
    switch (action.type) {

      case FacebookConstants.FACEBOOK_LOGGED_IN:
        // console.log("FACEBOOK_LOGGED_IN action.data:", action.data);
        FacebookActions.voterFacebookSignInAuth(action.data.authResponse);
        FacebookActions.getFacebookData();
        return {
          ...state,
          authData: action.data
        };

      case FacebookConstants.FACEBOOK_RECEIVED_DATA:
        // OLD
        // FacebookActions.facebookSignIn(action.data.id, action.data.email);
        // Cache the data in the API server
        // console.log("FACEBOOK_RECEIVED_DATA action.data:", action.data);
        FacebookActions.voterFacebookSignInData(action.data);
        // VoterActions.updateVoter(action.data);
        return {
          ...state,
          emailData: action.data
        };

      // OLD
      // case "facebookSignIn":
      //   VoterActions.voterRetrieve();
      //   return state;

      case "voterFacebookSignInRetrieve":
        if (action.res.facebook_sign_in_verified) {
          VoterActions.voterRetrieve();
        }
        return {
          ...state,
          facebook_retrieve_attempted: action.res.facebook_retrieve_attempted,
          facebook_sign_in_verified: action.res.facebook_sign_in_verified,
          facebook_sign_in_failed: action.res.facebook_sign_in_failed,
          facebook_secret_key: action.res.facebook_secret_key,
          voter_we_vote_id_attached_to_facebook: action.res.voter_we_vote_id_attached_to_facebook,
          voter_we_vote_id_attached_to_facebook_email: action.res.voter_we_vote_id_attached_to_facebook_email,
          // facebook_email: action.res.facebook_email,
          // facebook_first_name: action.res.facebook_first_name,
          // facebook_middle_name: action.res.facebook_middle_name,
          // facebook_last_name: action.res.facebook_last_name,
          // facebook_profile_image_url_https: action.res.facebook_profile_image_url_https,
        };

      case "voterFacebookSignInSave":
        if (action.res.save_profile_data) {
          // Only reach out for the Facebook Sign In information if the save_profile_data call has completed
          FacebookActions.voterFacebookSignInRetrieve();
        }
        return state;

      case "voterSignOut":
        return {
          authData: {},
          pictureData: {},
          emailData: {}
        };

      case FacebookConstants.FACEBOOK_SIGN_IN_DISCONNECT:
        this.disconnectFromFacebook();
        return state;

      case FacebookConstants.FACEBOOK_RECEIVED_PICTURE:
          FacebookActions.savePhoto(action.data.data.url);
          return state;

      default:
        return state;
      }
    }
  }

module.exports = new FacebookStore(Dispatcher);
