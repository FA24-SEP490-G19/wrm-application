package com.wrm.application.service;

import com.wrm.application.dto.ChangePasswordDTO;
import com.wrm.application.dto.UserDTO;
import com.wrm.application.exception.DataNotFoundException;
import com.wrm.application.model.User;
import com.wrm.application.response.user.UserResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.util.List;

public interface IUserService {
    UserResponse createUser(UserDTO userDTO) throws Exception;

    String login(String email, String password) throws Exception;
    List<UserDTO> getAllUsers();

    User getUserByEmail(String email) throws Exception;
    List<UserDTO> getManagerHaveNotWarehouse();
    void changePassword(String email, ChangePasswordDTO changePasswordDTO) throws Exception;

    void resetPassword(Long userId, String newPassword) throws Exception;

    UserDTO getUserById(Long id) throws Exception;


    List<UserDTO> getAllCustomers();

    List<UserDTO> getAllSales();

    List<UserDTO> getAllUser();

    User createUserWithRole(UserDTO userDTO) throws Exception;
}
