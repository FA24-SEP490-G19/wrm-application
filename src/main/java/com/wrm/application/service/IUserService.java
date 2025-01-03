package com.wrm.application.service;

import com.wrm.application.dto.auth.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.model.User;
import com.wrm.application.response.user.UserResponse;

import java.util.List;

public interface IUserService {
    UserResponse createUser(UserDTO userDTO) throws Exception;

    void verifyEmail(String token) throws Exception;

    String login(String email, String password) throws Exception;

    User getUserByEmail(String email) throws Exception;

    List<UserDTO> getManagerHaveNotWarehouse();

    void changePassword(String email, ChangePasswordDTO changePasswordDTO) throws Exception;

    void resetPassword(String email) throws Exception;

    UserDTO getUserById(Long id) throws Exception;

    List<UserDTO> getAllCustomers();

    List<UserDTO> getAllSales();

    List<UserDTO> getAllUser();

    User createUserWithRole(UserDTO userDTO) throws Exception;

    UserDTO updateUserProfile(String email, UserDTO updatedUserDTO);

    List<UserDTO> getAllCustomerBySales(String remoteUser) throws Exception;
}
