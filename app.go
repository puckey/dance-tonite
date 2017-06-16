package app

import (
	"encoding/base64"
	"net/http"
	"strings"
)

var (
	BasicRealm = "Authorization Required"
)

// BasicAuthFunc returns a Handler that authenticates via Basic Auth using the provided function.
// The function should return true for a valid username/password combination.
func BasicAuthFunc(authfn func(string, string, *http.Request) bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
			auth := req.Header.Get("Authorization")
			if len(auth) < 6 || auth[:6] != "Basic " {
				unauthorized(res)
				return
			}
			b, err := base64.StdEncoding.DecodeString(auth[6:])
			if err != nil {
				unauthorized(res)
				return
			}
			tokens := strings.SplitN(string(b), ":", 2)
			if len(tokens) != 2 || !authfn(tokens[0], tokens[1], req) {
				unauthorized(res)
				return
			}

			// enable CORS
			res.Header().Add("Access-Control-Allow-Origin", "*")

			next.ServeHTTP(res, req)
		})
	}
}

func unauthorized(res http.ResponseWriter) {
	res.Header().Set("WWW-Authenticate", "Basic realm=\""+BasicRealm+"\"")
	http.Error(res, "Not Authorized", http.StatusUnauthorized)
}

func init() {
	www := http.FileServer(http.Dir("dist"))
	auth := BasicAuthFunc(func(u, p string, r *http.Request) bool {
		return p == "realityreality"
	})
	www = auth(www)

	http.Handle("/", www)
}

