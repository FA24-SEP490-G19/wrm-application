package com.wrm.application.service;

import com.wrm.application.dto.auth.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.User;
import com.wrm.application.response.user.UserResponse;

public interface IUserService {
    UserResponse createUser(UserDTO userDTO) throws Exception;

    String login(String email, String password) throws Exception;

    User getUserByEmail(String email) throws Exception;

    void changePassword(String email, ChangePasswordDTO changePasswordDTO) throws Exception;

    void resetPassword(Long userId, String newPassword) throws Exception;
}
