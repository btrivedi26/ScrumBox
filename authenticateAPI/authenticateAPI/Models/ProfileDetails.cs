using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace authenticateAPI.Models
{
    public class ProfileDetails
    {
        public string firstName { get; set; }
        public string headline { get; set; }
        public string id { get; set; }
        public string lastName { get; set; }
        public Sitestandardprofilerequest siteStandardProfileRequest { get; set; }
    }
    public class Sitestandardprofilerequest
    {
        public string url { get; set; }
    }
}