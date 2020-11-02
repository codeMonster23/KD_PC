const JSEncrypt = require('node-jsencrypt');
const jsEncrypt = new JSEncrypt();
const moment = require('moment');
//公钥
const PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtSCuh6W5Rh4XR0LTHzhAZF+BVDv0XJIaSiuuK7bf2JB2f6Z3q3BdTwhWfrbBaDYN4xg5Ja8ggw8zys/798n1wpr8xlOlsUqMWI3JXJy35QHP3WCpvouLHcdKTLCY6jq950fhYpq0BBvIOyK/a+ZzMy2OFrYm0LiJXlnb5Xiw/JQmIg/ikzI5UlUDN6vLabV/cFQAlKVXqYyeByr569BP/DUkh/3kyYo+PdXfE6cW4zWj+wLDAq+FQlrKi/Q9Fd42uSP2cOApRNzoaWn9j8jAXo/+QpFTUeCj0qRUdIMJ5X0EmBhEy/hdap8bQsiCzteRImZmLu3of/i3FP5Wladq0wIDAQAB';
//私钥
const PRIVATE_KEY = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBALwcyvYIGmhk+be320JWWsq1OYjiM0lzv8eHGMgSIOMLxzM/g9X7jguNe8thxJXR/CLqcTgsfZzk8E8Sc9+qnSDxNl5f5tga93vRxd5713zAeAGqLiTQnRffdzRmdbsmu5+0/K8mj056VhKh8FdBNzAj7e4iX9i+uBBG/oDmZbTVAgMBAAECgYEAmgNU5NTDkj9B+Pnt6UU8doSjw3+3j+bV2K2yS3QUOvAUus/Ax7x6ktjWxzCXvDY9IfUil2RNv9vtKEAqYLCWjc+lf8PV/yH1b7NEgyeAPBXtAJRoOnmYL2bdPW92kP9KgxJruF6Dz/C5AmMOncsvq8ABD+9Darn4p8dwj2ZC4O0CQQDf/AHmZsQokEItfCy4mHS9UbxbfIhEUv1ApPh/+Sr7NkJkHWYCtBQo+8jKO6zurAZQgWBPD1XX2UE4R+VIiZazAkEA1wAqtMvGhccyRZr+6kpkpDIa8+9jOE+nGUzqTDvgCID6as8AzOONFVVK6m/UUqkhcJ8Qu1pF36BGojy5BX2KVwJBAJSFpbji0hXXupowqfLp3RcgmNbNWAp+QUJZYhJx5cdYbmO2fssyH+AhPT6knYJR/YnqkDM8hv6vKCkqu2YDHjMCQAOA8TE5EOclM+CGghj3VWSHnIDVKdzFD4gOBNNxNlltIKeU8AJmwunSFgJ0CBXAw9a+ANvMwM7AIeaK7sj0HskCQAvxfDCq7gaNx+pfu0FHG8Gix08A/A6foggBl1fVu+L9sr9ZuOQ3HbXnl28F9ewuB9xdjnLUDjp7W7U0pB+vKoQ=';

module.exports = {
    encrypt: function (uid) {
        jsEncrypt.setPublicKey('-----BEGIN PUBLIC KEY-----' + PUBLIC_KEY + '-----END PUBLIC KEY-----');
        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
        let content = uid + ':::' + currentTime;
        let encrypted = jsEncrypt.encrypt(content);
        return encrypted;
    },
    decrypt: function(encrypted){
        jsEncrypt.setPrivateKey('-----BEGIN RSA PRIVATE KEY-----'+PRIVATE_KEY+'-----END RSA PRIVATE KEY-----');
        let uncrypted = jsEncrypt.decrypt(encrypted);
        return uncrypted;
    }
};