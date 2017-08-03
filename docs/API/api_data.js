define({ "api": [
  {
    "type": "POST",
    "url": "/activate",
    "title": "Activate user",
    "name": "Activate_user",
    "group": "User",
    "description": "<p>Activate a user</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/endpoints/user/user.route.ts",
    "groupTitle": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "defaultValue": "bearer {{token}}",
            "description": "<p>token is sent by mail after a /register call</p>"
          }
        ]
      }
    }
  },
  {
    "type": "POST",
    "url": "/changePassword",
    "title": "Change password",
    "name": "Change_password",
    "group": "User",
    "description": "<p>Change password, given a reset password token</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "password",
            "description": "<p>New Password</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/endpoints/user/user.route.ts",
    "groupTitle": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "defaultValue": "bearer {{token}}",
            "description": "<p>token is sent by mail after a /resetlink call</p>"
          }
        ]
      }
    }
  },
  {
    "type": "POST",
    "url": "/login",
    "title": "Login",
    "name": "Login",
    "group": "User",
    "description": "<p>Login with email password</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "password",
            "description": "<p>Password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>Token for HTTP APIs authentication</p>"
          },
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "_id",
            "description": ""
          },
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "serial",
            "description": ""
          },
          {
            "group": "200",
            "type": "number",
            "optional": false,
            "field": "admin",
            "defaultValue": "0,",
            "description": "<p>distributor = 1, subsidiary = 2, partner = 3, installer = 4</p>"
          },
          {
            "group": "200",
            "type": "boolean",
            "optional": false,
            "field": "activated",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n{\n    \"token\": \"gPjyD1d9t2Nz1k6m\",\n    \"_id\": \"5967957ae0f5625e292a9989\",\n    \"email\": \"walter@zenga.it\",\n    \"role\": 0,\n    \"activated\": true,\n    \"serial\": \"serialnumber2\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/endpoints/user/user.route.ts",
    "groupTitle": "User"
  },
  {
    "type": "POST",
    "url": "/logout",
    "title": "Logout",
    "name": "Logout",
    "group": "User",
    "description": "<p>Logout</p>",
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/endpoints/user/user.route.ts",
    "groupTitle": "User",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Authorization",
            "defaultValue": "bearer {{token}}",
            "description": "<p>token is given in a /login call</p>"
          }
        ]
      }
    }
  },
  {
    "type": "POST",
    "url": "/register",
    "title": "Register User",
    "name": "Register_User",
    "group": "User",
    "description": "<p>Register User</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          },
          {
            "group": "Parameter",
            "optional": false,
            "field": "serial",
            "description": "<p>Serial</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "_id",
            "description": ""
          },
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": ""
          },
          {
            "group": "200",
            "type": "string",
            "optional": false,
            "field": "serial",
            "description": ""
          },
          {
            "group": "200",
            "type": "number",
            "optional": false,
            "field": "admin",
            "defaultValue": "0,",
            "description": "<p>distributor = 1, subsidiary = 2, partner = 3, installer = 4</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n{\n    \"serial\": \"serialnumber2\",\n    \"email\": \"lol2@copter.it\",\n    \"role\": 0,\n    \"_id\": \"596cc3613f03db092aca8d98\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/endpoints/user/user.route.ts",
    "groupTitle": "User"
  },
  {
    "type": "POST",
    "url": "/resetlink",
    "title": "Reset password link",
    "name": "Reset_password_link",
    "group": "User",
    "description": "<p>Send by mail a reset password link</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "optional": false,
            "field": "email",
            "description": "<p>Email</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/api/endpoints/user/user.route.ts",
    "groupTitle": "User"
  }
] });
