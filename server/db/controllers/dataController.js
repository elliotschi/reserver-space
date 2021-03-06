<<<<<<< 8a581e9dc788e1fa846cda55991a696e4c2c48c3
var models = require('../models');
var _ = require('underscore');
var helper = require('../../config/helpers.js');
var sendGrid = process.env.SEND_GRID || require('../../email/sendGrid.js');

module.exports = {
  getAllData: function(req, res, next) {
    var userId = req.body.userId;

    helper.getAllData(userId)
      .then(function(result) {
        var locations = _.map(result[0], function(val, index, list) {
          return val.json_build_object;
        });
        var newLocations = [];
        _.each(locations, function(location, index, list) {
          if (!_.find(newLocations, function(value) {
            return (value.id === location.id);
          })) {
            newLocations.push({
              id: location.id,
              locationName: location.locationName,
              rooms: [location.rooms]
            });
          } 
          _.each(newLocations, function(newLocation, index, list) {
            if (newLocation.locationName === location.locationName) {
              newLocation.rooms.push(location.rooms);
            }
          });
        });
      res.json({
          locations: newLocations
          });
        });  
  },
  addLocation: function(req, res, next) {
    var userId = req.body.userId;
    var locationName = req.body.locationName;

    models.Location.create({
      location_name: locationName
    })
    .then(function(newLocation) {
      models.UserLocation.create({
        UserId: userId,
        LocationId: newLocation.id
      });

      res.json({
        id: newLocation.id,
        locationName: newLocation.location_name,
        rooms: []
      });
    })
    .catch(function(error) {
      next(error);
    });
  },
  addRoomsAndUsers: function(req, res, next) {
    var locationId = req.body.locationId;
    var usersToAdd = req.body.usersToAdd;
    var roomsToAdd = req.body.roomsToAdd;
    console.log(usersToAdd);

    if (usersToAdd) {
      _.each(usersToAdd.split(','), function(user, index, allUsersToAdd) {
        models.User.find({
          where: {
            username: user
          }
        })
        .then(function(foundUser) {
          if (!foundUser) {
            models.User.create({
              username: user,
              registered: false
            })
            .then(function(pendingUser) {
              models.UserLocation.create({
                UserId: pendingUser.id,
                LocationId: locationId
              });
              sendGrid.signupEmail(pendingUser.username);
            });
          } else {
            models.UserLocation.create({
              UserId: foundUser.id,
              LocationId: locationId
            });
          }
        });
      });
    }

    if (roomsToAdd) {
    roomsToAdd = roomsToAdd.split(',');
      var addedRooms = [];
      _.each(roomsToAdd, function(room, index, allRoomsToAdd) {
        models.Room.create({
          room_name: room,
          LocationId: locationId
        })
        .then(function(newRoom) {
          console.log('location id', newRoom.dataValues.room_name);
          var newRoomObj = {
            id: newRoom.dataValues.id,
            roomName: newRoom.dataValues.room_name
          };
          addedRooms.push(newRoom.dataValues);
          res.json({
            addedRooms: addedRooms
          });
        });
      });
      
    }
  },
  addReservation: function(req, res, next) {
    var userId = req.body.userId;
    var locationId = req.body.locationId;
    var roomId = req.body.roomId;
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var reservationName = req.body.reservationName;
    var date = req.body.date;
    var location;
    var room;
    var createdByUser;

    models.Reservation.create({
      UserId: userId,
      RoomId: roomId,
      start_time: startTime,
      end_time: endTime,
      reservation_name: reservationName,
      // date: date
    })
    .then(function(newReservation) {
      res.json(newReservation);

      models.Location.findById(locationId).then(function(foundLocation) {
        location = foundLocation;
        
        models.Room.findById(roomId).then(function(foundRoom) {
          room = foundRoom;

          models.User.findById(userId).then(function(foundUser) {
            createdByUser = foundUser;

            var emailReservationDetails = {
              reservationName: reservationName,
              location: foundLocation.dataValues.location_name,
              room: foundRoom.dataValues.room_name,
              start: newReservation.start_time,
              end: newReservation.end_time,
              date: date,
              createdBy: foundUser.dataValues.username
            };
            helper.getAllUsersAtLocation(locationId)
              .then(function(result) {
                _.each(result[0], function(user) {
                  sendGrid.reservationEmail(user.username, emailReservationDetails);
                });
              })
              .catch(function(error) {
                next(error);
              })
          })
          .catch(function(error) {
            next(error);
          })
        })
        .catch(function(error) {
          next(error);
        })
      })
      .catch(function(error) {
        next(error);
      });
    });
  },
  getAllRoomsAndReservations: function(req, res) {
    var reservations = [];
    console.log(req.body.locationId);
    helper.getAllRooms(req.body.locationId)
      .then(function(result) {
        var rooms = _.map(result[0], function(val, index, list) {
          return val.json_build_object;
        });
        var newRooms = [];
        _.each(rooms, function(room, index, list) {
          if(!_.find(newRooms, function(value) {
            return (value.id === room.id);
          })) {
            newRooms.push({
              id: room.id,
              roomName: room.roomName,
              reservations: [room.reservations]
            });
          }
          _.each(newRooms, function(newRoom, index, list) {
            if (newRoom.id === room.id) {
              room.reservations.roomName = room.roomName;
              reservations.push(room.reservations);
            }
          });
        });

        res.json({
          reservations: reservations
        });
      });
  }
}

=======
var models = require('../models');
var _ = require('underscore');
var helper = require('../../config/helpers.js');
var sendGrid = process.env.SEND_GRID || require('../../email/sendGrid.js');

module.exports = {
  addLocation: function(req, res, next) {
    var userId = req.body.userId;
    var locationName = req.body.locationName;

    models.Location.create({
      location_name: locationName
    })
    .then(function(newLocation) {
      models.UserLocation.create({
        UserId: userId,
        LocationId: newLocation.id
      });

      res.json({
        id: newLocation.id,
        locationName: newLocation.location_name,
        rooms: []
      });
    })
    .catch(function(error) {
      next(error);
    });
  },
  addRoomsAndUsers: function(req, res, next) {
    var locationId = req.body.locationId;
    var usersToAdd = req.body.usersToAdd;
    var roomsToAdd = req.body.roomsToAdd;

    if (usersToAdd) {
      _.each(usersToAdd.split(','), function(user, index, allUsersToAdd) {
        models.User.find({
          where: {
            username: user
          }
        })
        .then(function(foundUser) {
          if (!foundUser) {
            models.User.create({
              username: user,
              registered: false
            })
            .spread(function(pendingUser) {
              models.UserLocation.create({
                UserId: pendingUser.id,
                LocationId: locationId
              });
              sendGrid.signupEmail(pendingUser.username);
            });
          }
          models.UserLocation.create({
            UserId: foundUser.id,
            LocationId: locationId
          });
        });
      });
    }

    if (roomsToAdd) {
    roomsToAdd = roomsToAdd.split(',');
      _.each(roomsToAdd, function(room, index, allRoomsToAdd) {
        console.log('room: ', room);
        models.Room.create({
          room_name: room,
          LocationId: locationId
        })
        .then(function(newRoom) {
          roomsToAdd[index] = {
            roomName: newRoom.room_name,
            roomId: newRoom.id
          }
        });
      });
      res.json({
        addedRooms: roomsToAdd
      });
    }
  },
  addReservation: function(req, res, next) {
    var userId = req.body.userId;
    var locationId = req.body.locationId;
    var roomId = req.body.roomId;
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var reservationName = req.body.reservationName;
    var location;
    var room;
    var createdByUser;

    models.Reservation.create({
      UserId: userId,
      RoomId: roomId,
      start_time: startTime,
      end_time: endTime,
      reservation_name: reservationName
    })
    .then(function(newReservation) {
      res.json({
        reservationName: newReservation.reservation_name,
        reservationId: newReservation.id
      });

      models.Location.findById(locationId).then(function(foundLocation) {
        location = foundLocation;
      })
      .catch(function(error) {
        next(error);
      });

      models.Room.findById(roomId).then(function(foundRoom) {
        room = foundRoom;
      })
      .catch(function(error) {
        next(error);
      });

      models.User.findById(userId).then(function(foundUser) {
         createdByUser = foundUser;
      })
      .catch(function(error) {
        next(error);
      });

      var emailReservationDetails = {
        reservationName: reservationName,
        location: location,
        room: room,
        start: newReservation.start_time,
        end: newReservation.end_time,
        createdBy: createdByUser
      };

      var usersList = helper.getAllUsersAtLocation(locationId);
      _.each(usersList, function(user) {
        sendGrid.reservationEmail(user.username, emailReservationDetails);
      });
    })
    .catch(function(err) {
      next(err);
    });
  }
}
>>>>>>> revert back to before
