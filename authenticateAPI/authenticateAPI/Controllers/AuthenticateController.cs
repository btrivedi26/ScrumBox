using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Script.Serialization;
using authenticateAPI.Models;
using RestSharp;
using System.Web.Http.Cors;
using System.Configuration;
namespace authenticateAPI.Controllers
{
    public class AuthenticateController : ApiController
    {
      
        //[EnableCors(origins: "*", headers: "*", methods: "*")]
        //public IHttpActionResult Get(string code, string state)
        //{
        //    try
        //    {
        //        //Get Accedd Token
        //        var client = new RestClient("https://www.linkedin.com/oauth/v2/accessToken");
        //        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
        //        var request = new RestRequest(Method.POST);
        //        request.AddParameter("grant_type", "authorization_code");
        //        request.AddParameter("code", code);
        //        request.AddParameter("redirect_uri", "http://localhost:4000");
        //        request.AddParameter("client_id", "77y6szcym3yi3y");//77y6szcym3yi3y
        //        request.AddParameter("client_secret", "8vu2T0u2g8hQhYBd");//8vu2T0u2g8hQhYBd

        //        //request.AddParameter("client_id", "78tuxrz2ilh6cu");//77y6szcym3yi3y
        //        //request.AddParameter("client_secret", "chiIQpga33iaLZgp");//8vu2T0u2g8hQhYBd

        //        IRestResponse response = client.Execute(request);
        //        if (response.StatusCode != HttpStatusCode.BadRequest)
        //        {
        //            var content = response.Content;

        //            //Fetch AccessToken
        //            JavaScriptSerializer jsonSerializer = new JavaScriptSerializer();
        //            LinkedInTokenDetails linkedINVM = jsonSerializer.Deserialize<LinkedInTokenDetails>(content);

        //            //Get Profile Details
        //            client = new RestClient("https://api.linkedin.com/v1/people/~?oauth2_access_token=" + linkedINVM.access_token + "&format=json");
        //            request = new RestRequest(Method.GET);
        //            response = client.Execute(request);
        //            content = response.Content;

        //            jsonSerializer = new JavaScriptSerializer();
        //            ProfileDetails linkedINResVM = jsonSerializer.Deserialize<ProfileDetails>(content);

        //            return Ok(linkedINResVM);
        //        }
        //        else
        //        {
        //            return Ok("No Response");
        //        }

        //    }
        //    catch
        //    {
        //        throw;
        //    }
        //}
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        public IHttpActionResult Get(string code, string state)
        {
            try
            {
                //Get Accedd Token
                string tokenURL = ConfigurationManager.AppSettings["linkedinTokenURL"].ToString().Trim();
                string redirectURL = ConfigurationManager.AppSettings["redirect_uri"].ToString().Trim();
                string clientID= ConfigurationManager.AppSettings["client_id"].ToString().Trim();
                string clientSecret = ConfigurationManager.AppSettings["client_secret"].ToString().Trim();
                string linkedInURL = ConfigurationManager.AppSettings["linkedinTokenProfileURL"].Trim();
                //
                var client = new RestClient(tokenURL);
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
                var request = new RestRequest(Method.POST);
                request.AddParameter("grant_type", "authorization_code");
                request.AddParameter("code", code);
                request.AddParameter("redirect_uri", redirectURL);
                request.AddParameter("client_id", clientID);//77y6szcym3yi3y
                request.AddParameter("client_secret", clientSecret);//8vu2T0u2g8hQhYBd

                //request.AddParameter("client_id", "78tuxrz2ilh6cu");//77y6szcym3yi3y
                //request.AddParameter("client_secret", "chiIQpga33iaLZgp");//8vu2T0u2g8hQhYBd

                IRestResponse response = client.Execute(request);
                if (response.StatusCode != HttpStatusCode.BadRequest)
                {
                    var content = response.Content;

                    //Fetch AccessToken
                    JavaScriptSerializer jsonSerializer = new JavaScriptSerializer();
                    LinkedInTokenDetails linkedINVM = jsonSerializer.Deserialize<LinkedInTokenDetails>(content);

                    //Get Profile Details
                    // client = new RestClient("https://api.linkedin.com/v1/people/~?oauth2_access_token=" + linkedINVM.access_token + "&format=json");
                    client = new RestClient(linkedInURL + linkedINVM.access_token + "&format=json");
                    request = new RestRequest(Method.GET);
                    response = client.Execute(request);
                    content = response.Content;

                    jsonSerializer = new JavaScriptSerializer();
                    ProfileDetails linkedINResVM = jsonSerializer.Deserialize<ProfileDetails>(content);

                    return Ok(linkedINResVM);
                }
                else
                {
                    return Ok("No Response");
                }

            }
            catch
            {
                throw;
            }
        }

       
    }
}
